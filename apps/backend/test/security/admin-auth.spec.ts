import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

/*
Test ID: TEST-ADMIN-AUTH-001
File: apps/backend/test/security/admin-auth.spec.ts
Purpose: Verify that normal users cannot access admin-only endpoints (/users, /films/admin/all, etc.).
Precondition: User A has role='user', Admin B has role='admin', SuperAdmin C has role='superadmin'.
Action: Call admin endpoints with tokens from User A, Admin B, and SuperAdmin C.
Expected: User A receives HTTP 403 Forbidden; Admin B & SuperAdmin C receive HTTP 200 OK.
Security property being tested: Role-Based Access Control (RBAC) & Authorization Enforcement.
*/

describe('Admin & SuperAdmin RBAC Authorization (TEST-ADMIN-AUTH-001)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let normalUserToken: string;
  let adminToken: string;
  let superAdminToken: string;
  let normalUserId: number;
  let adminUserId: number;
  let superAdminUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Normal User
    const normalUser = await prisma.user.create({
      data: {
        name: 'Normal User RBAC Test',
        email: `normal.rbac.${Date.now()}@example.com`,
        password: 'hashedpassword',
        role: 'user',
      },
    });
    normalUserId = normalUser.id;

    // Admin User
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User RBAC Test',
        email: `admin.rbac.${Date.now()}@example.com`,
        password: 'hashedpassword',
        role: 'admin',
      },
    });
    adminUserId = adminUser.id;

    // SuperAdmin User
    const superAdminUser = await prisma.user.create({
      data: {
        name: 'SuperAdmin User RBAC Test',
        email: `super.rbac.${Date.now()}@example.com`,
        password: 'hashedpassword',
        role: 'superadmin',
      },
    });
    superAdminUserId = superAdminUser.id;

    const jwtService = app.get(JwtService);
    normalUserToken = jwtService.sign({ sub: normalUser.id, email: normalUser.email, role: normalUser.role });
    adminToken = jwtService.sign({ sub: adminUser.id, email: adminUser.email, role: adminUser.role });
    superAdminToken = jwtService.sign({ sub: superAdminUser.id, email: superAdminUser.email, role: superAdminUser.role });
  });

  afterAll(async () => {
    const ids = [normalUserId, adminUserId, superAdminUserId].filter(Boolean);
    if (ids.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: ids } } }).catch(() => {});
    }
    await app.close();
  });

  it('TEST-ADMIN-AUTH-001-A: Normal user MUST be denied access to /users with HTTP 403 Forbidden', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${normalUserToken}`);

    expect(res.status).toBe(403);
  });

  it('TEST-ADMIN-AUTH-001-B: Admin user MUST be allowed access to /users', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('TEST-ADMIN-AUTH-001-C: SuperAdmin user MUST be allowed access to /users', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
  });
});
