import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { PaymentService } from '../../src/payment/payment.service';
import { PaymentStatus } from '@prisma/client';

/*
Test ID: TEST-PAYMENT-001
File: apps/backend/test/security/payment-race.spec.ts
Purpose: Verify that concurrent calls to verifyCoinPayment for the same orderId credit coins exactly once.
Precondition: User exists in DB, a pending CoinPayment record exists, and Midtrans API returns status 'settlement'.
Setup: Mock Midtrans Snap SDK status method to return { transaction_status: 'settlement', fraud_status: 'accept' }.
Action: Send 10 concurrent POST requests to /payment/verify-coin-payment for the same orderId.
Expected: Coins are incremented exactly once (e.g. +50), status is updated to 'paid', and duplicate credits are prevented.
Security property being tested: Idempotency & Race Condition Guard on Top Up Coin verification.
*/

describe('SEC-001 — Payment Double Credit (TEST-PAYMENT-001)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let testUserId: number;
  const testOrderId = `COIN-TEST-RACE-${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // 1. Create temporary test user
    const user = await prisma.user.create({
      data: {
        name: 'Test Race Payment User',
        email: `race.pay.${Date.now()}@example.com`,
        password: 'hashedpassword',
        coins: 0,
      },
    });
    testUserId = user.id;

    // 2. Create JWT Token for test user
    const jwtService = app.get(JwtService);
    userToken = jwtService.sign({ sub: user.id, email: user.email, role: user.role });

    // 3. Create a CoinPackage if none exists
    let pkg = await prisma.coinPackage.findFirst({ where: { is_active: true } });
    if (!pkg) {
      pkg = await prisma.coinPackage.create({
        data: {
          slug: 'coin_50_test',
          name: 'Paket 50 Koin Test',
          coins_amount: 50,
          price: 20000,
          is_active: true,
        },
      });
    }

    // 4. Create pending CoinPayment record in DB
    await prisma.coinPayment.create({
      data: {
        order_id: testOrderId,
        userId: testUserId,
        packageId: pkg.id,
        coins_added: 50,
        amount: 20000,
        status: PaymentStatus.pending,
      },
    });

    // 5. Mock Midtrans Snap SDK status method to return 'settlement' deterministically
    const paymentService = app.get(PaymentService);
    if (paymentService && (paymentService as any).snap) {
      (paymentService as any).snap.transaction = {
        status: jest.fn().mockResolvedValue({
          transaction_status: 'settlement',
          fraud_status: 'accept',
          order_id: testOrderId,
        }),
      };
    }
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      await prisma.coinPayment.deleteMany({ where: { userId: testUserId } }).catch(() => {});
      await prisma.user.deleteMany({ where: { id: testUserId } }).catch(() => {});
    }
    await app.close();
  });

  it('TEST-PAYMENT-001: 10 concurrent verification requests should credit coins EXACTLY once', async () => {
    // Action: Fire 10 concurrent verification requests for the same orderId
    const requests = Array.from({ length: 10 }).map(() =>
      request(app.getHttpServer())
        .post('/payment/verify-coin-payment')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ orderId: testOrderId })
    );

    const responses = await Promise.all(requests);

    // Verify all HTTP requests completed
    responses.forEach((res) => {
      expect([200, 201]).toContain(res.status);
    });

    // Assert DB State
    const updatedUser = await prisma.user.findUnique({ where: { id: testUserId } });
    const updatedPayment = await prisma.coinPayment.findUnique({ where: { order_id: testOrderId } });

    // Coins MUST be exactly 50, NOT 500 (10x)
    expect(updatedUser?.coins).toBe(50);
    expect(updatedPayment?.status).toBe(PaymentStatus.paid);
  });
});
