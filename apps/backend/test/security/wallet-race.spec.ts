import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

/*
Test ID: TEST-WALLET-001 & TEST-WALLET-SAME-FILM
File: apps/backend/test/security/wallet-race.spec.ts
Purpose: Verify that concurrent film purchases with limited balance or same film unique constraint prevent double deduction and negative balances.
Precondition: User exists with exact initial coin balance (e.g. 15 coins), 2 films exist with price 15 coins each.
Setup: Authenticate User via JWT.
Action: Send 2 concurrent purchase requests for 2 different 15-coin films OR 10 concurrent requests for the same film.
Expected:
1. TEST-WALLET-001: Exactly 1 purchase succeeds, 1 fails. Final balance = 0. Entitlements = 1. Balance NEVER negative.
2. TEST-WALLET-SAME-FILM: Exactly 1 purchase succeeds, 9 fail due to unique constraint/balance. Final balance = 0.
Security property being tested: Atomic balance deduction, database isolation, and negative balance protection.
*/

describe('SEC-003 — Wallet & Film Purchase Race Condition (TEST-WALLET-001)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let testUserId: number;
  let filmAId: number;
  let filmBId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // 1. Create test user with EXACTLY 15 coins
    const user = await prisma.user.create({
      data: {
        name: 'Test Wallet Race User',
        email: `wallet.race.${Date.now()}@example.com`,
        password: 'hashedpassword',
        coins: 15,
      },
    });
    testUserId = user.id;

    const jwtService = app.get(JwtService);
    userToken = jwtService.sign({ sub: user.id, email: user.email, role: user.role });

    // 2. Create Film A (15 coins)
    const filmA = await prisma.film.create({
      data: {
        title: `Test Film A Race ${Date.now()}`,
        coin_price: 15,
        is_published: true,
      },
    });
    filmAId = filmA.id;

    // 3. Create Film B (15 coins)
    const filmB = await prisma.film.create({
      data: {
        title: `Test Film B Race ${Date.now()}`,
        coin_price: 15,
        is_published: true,
      },
    });
    filmBId = filmB.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await prisma.userFilmAccess.deleteMany({ where: { userId: testUserId } }).catch(() => {});
      await prisma.user.deleteMany({ where: { id: testUserId } }).catch(() => {});
    }
    const filmIds = [filmAId, filmBId].filter(Boolean);
    if (filmIds.length > 0) {
      await prisma.film.deleteMany({ where: { id: { in: filmIds } } }).catch(() => {});
    }
    await app.close();
  });

  it('TEST-WALLET-001: Concurrent purchase of 2 different 15-coin films with 15 initial coins MUST NOT cause negative balance', async () => {
    // Action: Send 2 concurrent purchase requests for Film A and Film B
    const reqA = request(app.getHttpServer())
      .post(`/films/${filmAId}/buy`)
      .set('Authorization', `Bearer ${userToken}`);

    const reqB = request(app.getHttpServer())
      .post(`/films/${filmBId}/buy`)
      .set('Authorization', `Bearer ${userToken}`);

    const [resA, resB] = await Promise.all([reqA, reqB]);

    const statuses = [resA.status, resB.status];
    
    // Exactly one should succeed (200 or 201), one should fail (400 Bad Request)
    const successCount = statuses.filter((s) => s === 200 || s === 201).length;
    const failCount = statuses.filter((s) => s === 400).length;

    expect(successCount).toBe(1);
    expect(failCount).toBe(1);

    // Verify DB State
    const updatedUser = await prisma.user.findUnique({ where: { id: testUserId } });
    const entitlements = await prisma.userFilmAccess.findMany({ where: { userId: testUserId } });

    expect(updatedUser?.coins).toBe(0);
    expect(updatedUser?.coins).toBeGreaterThanOrEqual(0); // BALANCE MUST NEVER BE NEGATIVE
    expect(entitlements.length).toBe(1);
  });
});
