import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FilmModule } from './film/film.module';
import { BunnyModule } from './bunny/bunny.module';
import { UploadModule } from './upload/upload.module';
import { PaymentModule } from './payment/payment.module';
import { UserModule } from './user/user.module';
import { GenreModule } from './genre/genre.module';
import { ActorModule } from './actor/actor.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdModule } from './ad/ad.module';
import { MembershipPlanModule } from './membership-plan/membership-plan.module';
import { DiscountModule } from './discount/discount.module';
import { FeaturedFilmModule } from './featured-film/featured-film.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { PartnerLogoModule } from './partner-logo/partner-logo.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    PrismaModule,
    AuthModule,
    FilmModule,
    BunnyModule,
    UploadModule,
    PaymentModule,
    UserModule,
    GenreModule,
    ActorModule,
    AnalyticsModule,
    AdModule,
    MembershipPlanModule,
    DiscountModule,
    FeaturedFilmModule,
    SubscriptionModule,
    PartnerLogoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
