import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus, Logger, ParseIntPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkout(@Req() req: any, @Body('planId') planId: number) {
    const userId = req.user.sub;
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
