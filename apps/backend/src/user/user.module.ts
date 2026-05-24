import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController, UsersAdminController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UserService],
  controllers: [UserController, UsersAdminController]
})
export class UserModule {}
