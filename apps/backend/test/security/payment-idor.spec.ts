import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { PaymentService } from '../../src/payment/payment.service';
import { PaymentStatus } from '@prisma/client';

/*
Test ID: TEST-IDOR-001
File: apps/backend/test/security/payment-idor.spec.ts
Purpose: Verify that User B cannot verify or claim a CoinPayment order belonging to User A.
Precondition: User A has a pending CoinPayment record (order_id: COIN-USER-A-xxxx). User B is authenticated.
Setup: Create User A and User B, create CoinPayment for User A.
Action: User B sends POST /payment/verify-coin-payment with User A's orderId.
Expected: HTTP 404 Not Found error. User B does not receive coins, and User A's payment remains unchanged.
Security property being tested: Resource Ownership Check and Authorization Boundary.
*/

describe('IDOR Security Check (TEST-IDOR-001)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userAToken: string;
  let userBToken: string;
  let userAId: number;
  let userBId: number;
  const orderIdUserA = `COIN-IDOR-USER-A-${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // 1. Create User A
    const userA = await prisma.user.create({
      data: {
        name: 'User A IDOR Target',
        email: `usera.${Date.now()}@example.com`,
        password: 'hashedpassword',
        coins: 0,
      },
    });
    userAId = userA.id;

    // 2. Create User B (Attacker)
    const userB = await prisma.user.create({
      data: {
        name: 'User B IDOR Attacker',
        email: `userb.${Date.now()}@example.com`,
        password: 'hashedpassword',
        coins: 0,
      },
    });
    userBId = userB.id;

    const jwtService = app.get(JwtService);
    userAToken = jwtService.sign({ sub: userA.id, email: userA.email, role: userA.role });
    userBToken = jwtService.sign({ sub: userB.id, email: userB.email, role: userB.role });

    // 3. Create CoinPackage
    let pkg = await prisma.coinPackage.findFirst({ where: { is_active: true } });
    if (!pkg) {
      pkg = await prisma.coinPackage.create({
        data: {
          slug: 'coin_50_idor',
          name: 'Paket 50 Koin IDOR',
          coins_amount: 50,
          price: 20000,
          is_active: true,
        },
      });
    }

    // 4. Create CoinPayment for User A
    await prisma.coinPayment.create({
      data: {
        order_id: orderIdUserA,
        userId: userAId,
        packageId: pkg.id,
        coins_added: 50,
        amount: 20000,
        status: PaymentStatus.pending,
      },
    });

    // Mock Midtrans status check to return settlement
    const paymentService = app.get(PaymentService);
    if (paymentService && (paymentService as any).snap) {
      (paymentService as any).snap.transaction = {
        status: jest.fn().mockResolvedValue({
          transaction_status: 'settlement',
          fraud_status: 'accept',
          order_id: orderIdUserA,
        }),
      };
    }
  });

  afterAll(async () => {
    await prisma.coinPayment.deleteMany({ where: { order_id: orderIdUserA } }).catch(() => {});
    const ids = [userAId, userBId].filter(Boolean);
    if (ids.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: ids } } }).catch(() => {});
    }
    await app.close();
  });

  it('TEST-IDOR-001: User B MUST NOT be able to verify or claim User A orderId', async () => {
    // Action: User B attempts to verify User A's orderId
    const res = await request(app.getHttpServer())
      .post('/payment/verify-coin-payment')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ orderId: orderIdUserA });

    // Expected: 404 Not Found error
    expect(res.status).toBe(404);

    // Verify DB state: User B coins = 0, User A payment status remains pending
    const userB = await prisma.user.findUnique({ where: { id: userBId } });
    const paymentUserA = await prisma.coinPayment.findUnique({ where: { order_id: orderIdUserA } });

    expect(userB?.coins).toBe(0);
    expect(paymentUserA?.status).toBe(PaymentStatus.pending);
  });
});
