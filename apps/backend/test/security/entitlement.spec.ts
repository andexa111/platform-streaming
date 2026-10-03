import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

/*
Test ID: TEST-ENTITLEMENT-001
File: apps/backend/test/security/entitlement.spec.ts
Purpose: Verify that film coin price is strictly enforced from DB and client payload parameters are ignored.
Precondition: Film exists in DB with coin_price = 30. User has 50 coins.
Setup: Authenticate user.
Action: Send POST /films/:id/buy with client payload trying to set { coin_price: 1, price: 0 }.
Expected: Backend deducts exactly 30 coins from DB price, leaving user with 20 coins.
Security property being tested: Server-side Price Integrity / Anti-Tampering.
*/

describe('Price Tampering & Entitlement Check (TEST-ENTITLEMENT-001)', () => {
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

    // Create User with 50 coins
    const user = await prisma.user.create({
      data: {
        name: 'Test Price Tampering User',
        email: `tamper.${Date.now()}@example.com`,
        password: 'hashedpassword',
        coins: 50,
      },
    });
    testUserId = user.id;

    const jwtService = app.get(JwtService);
    userToken = jwtService.sign({ sub: user.id, email: user.email, role: user.role });

    // Create Film with price = 30 coins
    const film = await prisma.film.create({
      data: {
        title: `Test Film Tampering ${Date.now()}`,
        coin_price: 30,
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

  it('TEST-ENTITLEMENT-001: Client payload attempting to override coin_price MUST be ignored', async () => {
    // Action: Send payload with tampered prices
    const res = await request(app.getHttpServer())
      .post(`/films/${testFilmId}/buy`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ coin_price: 1, price: 0, coins: 0 });

    expect([200, 201]).toContain(res.status);

    // Verify DB state: User coins should be 50 - 30 = 20 (NOT 50 - 1 = 49)
    const updatedUser = await prisma.user.findUnique({ where: { id: testUserId } });
    expect(updatedUser?.coins).toBe(20);
  });
});
