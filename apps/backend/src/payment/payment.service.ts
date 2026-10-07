import { Injectable, InternalServerErrorException, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubStatus, PaymentStatus, Role } from '@prisma/client';
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

  async getCoinPackages() {
    return this.prisma.coinPackage.findMany({
      where: { is_active: true },
      orderBy: { price: 'asc' },
    });
  }

  async updateCoinPackage(id: number, data: { price?: number; coins_amount?: number; name?: string }) {
    return this.prisma.coinPackage.update({
      where: { id },
      data,
    });
  }

  async getAdminTransactions() {
    const coinPayments = await this.prisma.coinPayment.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        package: { select: { id: true, name: true, coins_amount: true } },
      },
    });

    const filmPurchases = await this.prisma.userFilmAccess.findMany({
      take: 100,
      orderBy: { purchased_at: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        film: { select: { id: true, title: true } },
      },
    });

    return {
      coinPayments,
      filmPurchases,
    };
  }

  async createCoinTransaction(userId: number, packageId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const coinPkg = await this.prisma.coinPackage.findUnique({
      where: { id: packageId },
    });

    if (!coinPkg || !coinPkg.is_active) {
      throw new BadRequestException('Paket koin tidak ditemukan atau tidak aktif');
    }

    const orderId = `COIN-${Date.now()}-U${userId}`;

    await this.prisma.coinPayment.create({
      data: {
        order_id: orderId,
        userId: userId,
        packageId: coinPkg.id,
        coins_added: coinPkg.coins_amount,
        amount: coinPkg.price,
        status: PaymentStatus.pending,
      },
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: coinPkg.price,
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
      },
      item_details: [
        {
          id: coinPkg.slug,
          price: coinPkg.price,
          quantity: 1,
          name: `Top Up ${coinPkg.name}`,
        },
      ],
      callbacks: {
        finish: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/coins`,
      },
    };

    try {
      const transaction = await this.snap.createTransaction(parameter);
      return {
        token: transaction.token,
        redirect_url: transaction.redirect_url,
        order_id: orderId,
      };
    } catch (error) {
      this.logger.error('Failed to create Midtrans coin transaction', error);
      throw new InternalServerErrorException('Payment gateway error');
    }
  }

  async verifyCoinPayment(userId: number, orderId: string) {
    const coinPayment = await this.prisma.coinPayment.findUnique({
      where: { order_id: orderId },
    });

    if (!coinPayment || coinPayment.userId !== userId) {
      throw new NotFoundException('Transaksi koin tidak ditemukan');
    }

    if (coinPayment.status === PaymentStatus.paid) {
      return { message: 'Pembayaran sudah dikonfirmasi', paid: true, coins_added: coinPayment.coins_added };
    }

    try {
      const statusResponse = await this.snap.transaction.status(orderId);
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
        if (!fraudStatus || fraudStatus === 'accept') {
          const updateResult = await this.prisma.coinPayment.updateMany({
            where: { id: coinPayment.id, status: PaymentStatus.pending },
            data: { status: PaymentStatus.paid },
          });

          if (updateResult.count > 0) {
            await this.prisma.user.update({
              where: { id: userId },
              data: {
                coins: {
                  increment: coinPayment.coins_added,
                },
              },
            });
            this.logger.log(`Verified & added ${coinPayment.coins_added} coins to User ${userId} via status check.`);
          }
          return { message: 'Pembayaran berhasil dan koin telah ditambahkan!', paid: true, coins_added: coinPayment.coins_added };
        }
      }
    } catch (error: any) {
      this.logger.error('Failed to verify status with Midtrans API', error);
    }

    return { message: 'Pembayaran belum terkonfirmasi', paid: false };
  }

  async createTransaction(userId: number, planId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Ambil harga dari MembershipPlan
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id: planId },
      include: {
        discounts: {
          where: {
            is_active: true,
            valid_from: { lte: new Date() },
            valid_until: { gte: new Date() },
          },
          take: 1,
        },
      },
    });

    if (!plan || !plan.is_active) {
      throw new BadRequestException('Paket membership tidak tersedia');
    }

    // Hitung harga setelah diskon
    let amount = plan.price;
    const discount = plan.discounts[0];
    if (discount) {
      if (discount.percentage) {
        amount = Math.round(plan.price * (1 - discount.percentage / 100));
      } else if (discount.fixed_amount) {
        amount = Math.max(0, plan.price - discount.fixed_amount);
      }
    }

    const orderId = `ORDER-${Date.now()}-U${userId}`;

    const payment = await this.prisma.payment.create({
      data: {
        order_id: orderId,
        userId: userId,
        planId: plan.id,
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
          id: plan.slug,
          price: amount,
          quantity: 1,
          name: `Sinea Membership - ${plan.name}`,
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

      // Check if this is a Coin top-up payment
      if (orderId.startsWith('COIN-')) {
        const coinPayment = await this.prisma.coinPayment.findUnique({ where: { order_id: orderId } });
        if (!coinPayment) {
          this.logger.warn(`Coin Payment with Order ID ${orderId} not found.`);
          return;
        }

        if (transactionStatus == 'capture' || transactionStatus == 'settlement') {
          if (fraudStatus == 'challenge') {
            await this.prisma.coinPayment.update({
              where: { id: coinPayment.id },
              data: { status: PaymentStatus.pending },
            });
          } else if (fraudStatus == 'accept' || !fraudStatus) {
            // Atomic update to ensure coins are only added once
            const updateResult = await this.prisma.coinPayment.updateMany({
              where: { id: coinPayment.id, status: PaymentStatus.pending },
              data: { status: PaymentStatus.paid },
            });

            if (updateResult.count > 0) {
              await this.prisma.user.update({
                where: { id: coinPayment.userId },
                data: {
                  coins: {
                    increment: coinPayment.coins_added,
                  },
                },
              });
              this.logger.log(`Added ${coinPayment.coins_added} coins to User ${coinPayment.userId}`);
            }
          }
        } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
          await this.prisma.coinPayment.update({
            where: { id: coinPayment.id },
            data: { status: PaymentStatus.cancelled },
          });
        }
        return;
      }

      // Legacy Membership Payment
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
          await this.activateSubscription(payment.userId, payment.planId);
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

  private async activateSubscription(userId: number, planId: number) {
    const existingSub = await this.prisma.subscription.findFirst({
      where: { userId },
    });

    // Instead of activating, we just create/update as PENDING.
    // Admin needs to approve it to become ACTIVE.
    if (existingSub) {
      await this.prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          planId,
          status: SubStatus.pending,
        },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          userId,
          planId,
          status: SubStatus.pending,
        },
      });
    }

    this.logger.log(`Subscription for user ${userId} set to pending. Waiting for admin approval.`);
  }
}
