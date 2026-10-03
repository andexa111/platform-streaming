import { Controller, Get, Post, Body, UseGuards, Req, HttpCode, HttpStatus, Logger, ParseIntPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Get('coin-packages')
  async getCoinPackages() {
    return this.paymentService.getCoinPackages();
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout-coins')
  async checkoutCoins(@Req() req: any, @Body('packageId') packageId: number) {
    const userId = req.user.sub || req.user.id;
    return this.paymentService.createCoinTransaction(userId, packageId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-coin-payment')
  async verifyCoinPayment(@Req() req: any, @Body('orderId') orderId: string) {
    const userId = req.user.sub || req.user.id;
    return this.paymentService.verifyCoinPayment(userId, orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkout(@Req() req: any, @Body('planId') planId: number) {
    const userId = req.user.sub || req.user.id;
    return this.paymentService.createTransaction(userId, planId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any) {
    this.logger.log('Received Midtrans webhook');
    this.paymentService.handleWebhook(payload);
    return { status: 'OK' };
  }
}

