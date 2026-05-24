import { Controller, Get, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Roles('superadmin')
  @Get('pending')
  getPending() {
    return this.subscriptionService.getPendingSubscriptions();
  }

  @Roles('superadmin')
  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.approveSubscription(id);
  }

  @Roles('superadmin')
  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.rejectSubscription(id);
  }
}
