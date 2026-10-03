import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

/*
Test ID: TEST-COIN-MANIPULATION-001
File: apps/backend/test/security/coin-manipulation.spec.ts
Purpose: Verify that a normal user cannot directly manipulate server-controlled user fields (role, coins) via profile updates.
Precondition: User is registered with role='user' and coins=0.
Action: User sends PATCH /user/profile with body { "coins": 999999, "role": "admin" }.
Expected: The backend ignores or rejects the fields, user.role remains 'user', and user.coins remains 0.
Security property being tested: Mass Assignment / Server State Integrity.
*/

describe('Coin & Role Manipulation Protection (TEST-COIN-MANIPULATION-001)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let testUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    const user = await prisma.user.create({
      data: {
        name: 'Test Coin Manipulation User',
        email: `coin.tamper.${Date.now()}@example.com`,
        password: 'hashedpassword',
        role: 'user',
        coins: 0,
      },
    });
    testUserId = user.id;

    const jwtService = app.get(JwtService);
    userToken = jwtService.sign({ sub: user.id, email: user.email, role: user.role });
  });

  afterAll(async () => {
    if (testUserId) {
      await prisma.user.deleteMany({ where: { id: testUserId } }).catch(() => {});
    }
    await app.close();
  });

  it('TEST-COIN-MANIPULATION-001: Client MUST NOT be able to modify coins or role via PATCH /user/profile', async () => {
    const res = await request(app.getHttpServer())
      .patch('/user/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Updated Name OK',
        coins: 999999,
        role: 'admin',
      });

    // Check DB state to ensure role and coins were NOT altered
    const updatedUser = await prisma.user.findUnique({ where: { id: testUserId } });

    expect(updatedUser?.role).toBe('user');
    expect(updatedUser?.coins).toBe(0);
  });
});
