import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

/*
Test ID: TEST-WALLET-002
File: apps/backend/test/security/negative-balance.spec.ts
Purpose: Explicit regression test verifying that purchasing a film with insufficient coins is rejected and balance remains unchanged.
Precondition: User has 5 coins. Film costs 15 coins.
Action: User calls POST /films/:id/buy.
Expected: HTTP 400 Bad Request error ("Koin Anda tidak cukup"). Balance remains 5 coins (not -10). No entitlement created.
Security property being tested: Insufficient Balance Rejection & Non-negative Invariant.
*/

describe('Negative Balance & Insufficient Funds Rejection (TEST-WALLET-002)', () => {
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

    const user = await prisma.user.create({
      data: {
        name: 'Test Insufficient Funds User',
        email: `insufficient.${Date.now()}@example.com`,
        password: 'hashedpassword',
        coins: 5,
      },
    });
    testUserId = user.id;

    const jwtService = app.get(JwtService);
    userToken = jwtService.sign({ sub: user.id, email: user.email, role: user.role });

    const film = await prisma.film.create({
      data: {
        title: `Test Film Costly ${Date.now()}`,
        coin_price: 15,
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

  it('TEST-WALLET-002: User with 5 coins trying to buy 15-coin film MUST be rejected with HTTP 400 and balance unchanged', async () => {
    const res = await request(app.getHttpServer())
      .post(`/films/${testFilmId}/buy`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);

    const updatedUser = await prisma.user.findUnique({ where: { id: testUserId } });
    const entitlement = await prisma.userFilmAccess.findUnique({
      where: { userId_filmId: { userId: testUserId, filmId: testFilmId } },
    });

    expect(updatedUser?.coins).toBe(5);
    expect(entitlement).toBeNull();
  });
});
