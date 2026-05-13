import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubPlan } from '@prisma/client';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkout(@Req() req: any, @Body('plan') plan: SubPlan) {
    const userId = req.user.id;
    return this.paymentService.createTransaction(userId, plan);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any) {
    this.logger.log('Received Midtrans webhook');
    // Midtrans expects 200 OK immediately
    this.paymentService.handleWebhook(payload);
    return { status: 'OK' };
  }
}
