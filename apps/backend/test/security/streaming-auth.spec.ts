import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

/*
Test ID: TEST-STREAM-001 & TEST-STREAM-002
File: apps/backend/test/security/streaming-auth.spec.ts
Purpose: Verify that users without active 30-day film entitlement CANNOT obtain streaming URLs or decryption keys.
Precondition: Film exists in DB (coin_price = 15, video_id = 'films/1/index.m3u8'). User A has entitlement, User B does NOT.
Action:
1. User B requests GET /films/:id/stream without entitlement -> Expected 403 Forbidden.
2. User B requests GET /films/:id/key without entitlement -> Expected 403 Forbidden (Checks if Key endpoint is protected).
3. User A requests GET /films/:id/stream with active entitlement -> Expected 200 OK & stream_url returned.
Security property being tested: Stream entitlement authorization and AES-128 key access control.
*/

describe('Streaming Authorization & Key Security (TEST-STREAM-001)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userAToken: string;
  let userBToken: string;
  let userAId: number;
  let userBId: number;
  let testFilmId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // User A (Has Entitlement)
    const userA = await prisma.user.create({
      data: {
        name: 'User A Entitled Stream',
        email: `usera.stream.${Date.now()}@example.com`,
        password: 'hashedpassword',
        coins: 50,
      },
    });
    userAId = userA.id;

    // User B (No Entitlement)
    const userB = await prisma.user.create({
      data: {
        name: 'User B Unentitled Stream',
        email: `userb.stream.${Date.now()}@example.com`,
        password: 'hashedpassword',
        coins: 50,
      },
    });
    userBId = userB.id;

    const jwtService = app.get(JwtService);
    userAToken = jwtService.sign({ sub: userA.id, email: userA.email, role: userA.role });
    userBToken = jwtService.sign({ sub: userB.id, email: userB.email, role: userB.role });

    // Film with video_id
    const film = await prisma.film.create({
      data: {
        title: `Test Film Streaming ${Date.now()}`,
        coin_price: 15,
        is_published: true,
        video_id: `films/test/index.m3u8`,
      },
    });
    testFilmId = film.id;

    // Grant 30-day access to User A ONLY
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.userFilmAccess.create({
      data: {
        userId: userAId,
        filmId: testFilmId,
        coins_spent: 15,
        expires_at: expiresAt,
      },
    });
  });

  afterAll(async () => {
    if (testFilmId) {
      await prisma.userFilmAccess.deleteMany({ where: { filmId: testFilmId } }).catch(() => {});
      await prisma.film.deleteMany({ where: { id: testFilmId } }).catch(() => {});
    }
    const ids = [userAId, userBId].filter(Boolean);
    if (ids.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: ids } } }).catch(() => {});
    }
    await app.close();
  });

  it('TEST-STREAM-001: User B (without entitlement) MUST BE DENIED stream access with 403 Forbidden', async () => {
    const res = await request(app.getHttpServer())
      .get(`/films/${testFilmId}/stream`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(403);
  });

  it('TEST-STREAM-002: User A (with active entitlement) MUST BE ALLOWED stream access', async () => {
    const res = await request(app.getHttpServer())
      .get(`/films/${testFilmId}/stream`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('stream_url');
  });

  it('TEST-STREAM-003: User B (without entitlement) SHOULD NOT be able to download AES-128 key', async () => {
    const res = await request(app.getHttpServer())
      .get(`/films/${testFilmId}/key`)
      .set('Authorization', `Bearer ${userBToken}`);

    // Expecting 403 Forbidden or 404 Not Found if key entitlement check is enforced
    expect([403, 404]).toContain(res.status);
  });
});
