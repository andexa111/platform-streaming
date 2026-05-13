import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubPlan, SubStatus, PaymentStatus, Role } from '@prisma/client';
// @ts-ignore
import * as midtransClient from 'midtrans-client';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private snap: any;

  constructor(private prisma: PrismaService) {
    this.snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    });
  }

  async createTransaction(userId: number, plan: SubPlan) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const amount = plan === SubPlan.monthly ? 49000 : 490000;
    const orderId = `ORDER-${Date.now()}-U${userId}`;

    const payment = await this.prisma.payment.create({
      data: {
        order_id: orderId,
        userId: userId,
        plan: plan,
        amount: amount,
        status: PaymentStatus.pending,
      },
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
      },
      item_details: [
        {
          id: plan,
          price: amount,
          quantity: 1,
          name: `Sinea Subscription - ${plan === SubPlan.monthly ? 'Monthly' : 'Yearly'}`,
        },
      ],
    };

    try {
      const transaction = await this.snap.createTransaction(parameter);
      return {
        token: transaction.token,
        redirect_url: transaction.redirect_url,
        order_id: orderId,
      };
    } catch (error) {
      this.logger.error('Failed to create Midtrans transaction', error);
      throw new InternalServerErrorException('Payment gateway error');
    }
  }

  async handleWebhook(payload: any) {
    try {
      const statusResponse = await this.snap.transaction.notification(payload);
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      this.logger.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

      const payment = await this.prisma.payment.findUnique({ where: { order_id: orderId } });
      if (!payment) {
        this.logger.warn(`Payment with Order ID ${orderId} not found.`);
        return;
      }

      if (transactionStatus == 'capture' || transactionStatus == 'settlement') {
        if (fraudStatus == 'challenge') {
          await this.updatePaymentStatus(payment.id, PaymentStatus.pending);
        } else if (fraudStatus == 'accept' || !fraudStatus) {
          await this.updatePaymentStatus(payment.id, PaymentStatus.paid);
          await this.activateSubscription(payment.userId, payment.plan);
        }
      } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
        await this.updatePaymentStatus(payment.id, PaymentStatus.cancelled);
      } else if (transactionStatus == 'pending') {
        await this.updatePaymentStatus(payment.id, PaymentStatus.pending);
      }
    } catch (error) {
      this.logger.error('Error handling Midtrans webhook', error);
    }
  }

  private async updatePaymentStatus(paymentId: number, status: PaymentStatus) {
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status },
    });
  }

  private async activateSubscription(userId: number, plan: SubPlan) {
    const durationDays = plan === SubPlan.monthly ? 30 : 365;
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + durationDays);

    const existingSub = await this.prisma.subscription.findFirst({
      where: { userId },
    });

    if (existingSub) {
      await this.prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          plan,
          status: SubStatus.active,
          expired_at: expiredAt,
        },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          userId,
          plan,
          status: SubStatus.active,
          expired_at: expiredAt,
        },
      });
    }

    // Update user role to subscriber if not admin
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user && user.role === Role.user) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: Role.subscriber },
      });
    }
  }
}
