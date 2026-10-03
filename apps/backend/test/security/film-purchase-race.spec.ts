import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

/*
Test ID: TEST-WALLET-SAME-FILM
File: apps/backend/test/security/film-purchase-race.spec.ts
Purpose: Verify that 10 concurrent purchase requests for the EXACT SAME film by the same user deduct coins exactly once and create only 1 entitlement.
Precondition: User has 100 coins. Film costs 100 coins.
Action: Send 10 concurrent POST /films/:id/buy requests.
Expected Invariants:
1. Exactly 1 request succeeds (HTTP 200/201), 9 fail.
2. Final user coins = 0 (never negative).
3. Exactly 1 UserFilmAccess record exists for (userId, filmId).
Security Property: Database unique constraint handling (@@unique([userId, filmId])) & balance atomicity under race condition.
*/

describe('SEC-003 — Same Film Concurrent Purchase Race (TEST-WALLET-SAME-FILM)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let testUserId: number;
  let testFilmId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create User with 100 coins
    const user = await prisma.user.create({
      data: {
        name: 'Test Same Film Race User',
        email: `samefilm.race.${Date.now()}@example.com`,
        password: 'hashedpassword',
        coins: 100,
      },
    });
    testUserId = user.id;

    const jwtService = app.get(JwtService);
    userToken = jwtService.sign({ sub: user.id, email: user.email, role: user.role });

    // Create Film costing 100 coins
    const film = await prisma.film.create({
      data: {
        title: `Test Film Same Race ${Date.now()}`,
        coin_price: 100,
        is_published: true,
      },
    });
    testFilmId = film.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await prisma.userFilmAccess.deleteMany({ where: { userId: testUserId } }).catch(() => {});
      await prisma.user.deleteMany({ where: { id: testUserId } }).catch(() => {});
    }
    if (testFilmId) {
      await prisma.film.deleteMany({ where: { id: testFilmId } }).catch(() => {});
    }
    await app.close();
  });

  it('TEST-WALLET-SAME-FILM: 10 concurrent requests to buy the SAME film should result in exactly 1 successful purchase and 0 remaining coins', async () => {
    const requests = Array.from({ length: 10 }).map(() =>
      request(app.getHttpServer())
        .post(`/films/${testFilmId}/buy`)
        .set('Authorization', `Bearer ${userToken}`)
    );

    const responses = await Promise.all(requests);

    const statuses = responses.map((r) => r.status);
    // All requests should succeed with 200/201 (1 initial purchase + 9 idempotent existing-access responses)
    statuses.forEach((s) => expect([200, 201]).toContain(s));

    const updatedUser = await prisma.user.findUnique({ where: { id: testUserId } });
    const entitlements = await prisma.userFilmAccess.findMany({
      where: { userId: testUserId, filmId: testFilmId },
    });

    // Invariants:
    // 1. Coins deducted exactly ONCE (100 -> 0), never negative
    expect(updatedUser?.coins).toBe(0);
    expect(updatedUser?.coins).toBeGreaterThanOrEqual(0);
    // 2. Exactly 1 entitlement created, no duplicate entries
    expect(entitlements.length).toBe(1);
  });
});
