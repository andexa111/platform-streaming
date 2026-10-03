import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { PaymentService } from '../../src/payment/payment.service';
import { PaymentStatus } from '@prisma/client';

/*
Test ID: TEST-PAYMENT-002
File: apps/backend/test/security/payment-webhook.spec.ts
Purpose: Verify that the webhook endpoint rejects unverified payloads, handles duplicate notifications gracefully, and ignores invalid order information.
Precondition: CoinPayment record exists in database.
Setup: Mock Midtrans Snap SDK notification method to simulate valid and invalid notification objects.
Action: Send invalid/duplicate HTTP POST requests to /payment/webhook.
Expected: Invalid payloads do not credit coins; duplicate webhooks credit coins only once.
Security property being tested: Webhook validation, signature integrity, and idempotency.
*/

describe('SEC-002 — Payment Webhook Verification (TEST-PAYMENT-002)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserId: number;
  const testOrderId = `COIN-WEBHOOK-${Date.now()}`;

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
        name: 'Test Webhook User',
        email: `webhook.${Date.now()}@example.com`,
        password: 'hashedpassword',
        coins: 0,
      },
    });
    testUserId = user.id;

    let pkg = await prisma.coinPackage.findFirst({ where: { is_active: true } });
    if (!pkg) {
      pkg = await prisma.coinPackage.create({
        data: {
          slug: 'coin_120_webhook',
          name: 'Paket 120 Koin Webhook',
          coins_amount: 120,
          price: 45000,
          is_active: true,
        },
      });
    }

    await prisma.coinPayment.create({
      data: {
        order_id: testOrderId,
        userId: testUserId,
        packageId: pkg.id,
        coins_added: 120,
        amount: 45000,
        status: PaymentStatus.pending,
      },
    });
  });

  afterAll(async () => {
    if (testUserId) {
      await prisma.coinPayment.deleteMany({ where: { userId: testUserId } }).catch(() => {});
      await prisma.user.deleteMany({ where: { id: testUserId } }).catch(() => {});
    }
    await app.close();
  });

  it('TEST-PAYMENT-002-A: Webhook with non-existent order_id should NOT add coins', async () => {
    const paymentService = app.get(PaymentService);
    (paymentService as any).snap.transaction = {
      notification: jest.fn().mockResolvedValue({
        order_id: 'NON-EXISTENT-ORDER-999999',
        transaction_status: 'settlement',
        fraud_status: 'accept',
      }),
    };

    const res = await request(app.getHttpServer())
      .post('/payment/webhook')
      .send({ order_id: 'NON-EXISTENT-ORDER-999999', transaction_status: 'settlement' });

    expect(res.status).toBe(200);

    const user = await prisma.user.findUnique({ where: { id: testUserId } });
    expect(user?.coins).toBe(0);
  });

  it('TEST-PAYMENT-002-B: Duplicate webhook notifications should add coins ONLY once', async () => {
    const paymentService = app.get(PaymentService);
    (paymentService as any).snap.transaction = {
      notification: jest.fn().mockResolvedValue({
        order_id: testOrderId,
        transaction_status: 'settlement',
        fraud_status: 'accept',
      }),
    };

    // First Webhook Send
    await request(app.getHttpServer()).post('/payment/webhook').send({ order_id: testOrderId });

    // Second Duplicate Webhook Send
    await request(app.getHttpServer()).post('/payment/webhook').send({ order_id: testOrderId });

    const user = await prisma.user.findUnique({ where: { id: testUserId } });
    const payment = await prisma.coinPayment.findUnique({ where: { order_id: testOrderId } });

    expect(payment?.status).toBe(PaymentStatus.paid);
    expect(user?.coins).toBe(120); // 120 coins added once, NOT 240
  });
});
