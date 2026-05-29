import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

// Setup Prisma client dengan adapter pg (Prisma v7)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ==================== DATA ====================

const genres = [
  { name: 'Comedy', slug: 'comedy' },
  { name: 'Horror', slug: 'horror' },
  { name: 'Action', slug: 'action' },
  { name: 'Historical', slug: 'historical' },
  { name: 'Drama', slug: 'drama' },
  { name: 'Romance', slug: 'romance' },
  { name: 'Thriller', slug: 'thriller' },
  { name: 'Documentary', slug: 'documentary' },
];

const membershipPlans = [
  {
    slug: 'paket_1',
    name: 'Paket 1 Bulan',
    price: 50000,
    duration_months: 1,
    benefits: ['Akses Semua Film', 'Kualitas 4K HDR', 'Tanpa Iklan', 'Bisa Didownload', 'Akses Semua Perangkat'],
    max_devices: 4,
    quality: '4K HDR',
  },
  {
    slug: 'paket_2',
    name: 'Paket 3 Bulan',
    price: 150000,
    duration_months: 3,
    benefits: ['Akses Semua Film', 'Kualitas 4K HDR', 'Tanpa Iklan', 'Bisa Didownload', 'Akses Semua Perangkat'],
    max_devices: 4,
    quality: '4K HDR',
  },
  {
    slug: 'paket_3',
    name: 'Paket 6 Bulan',
    price: 300000,
    duration_months: 6,
    benefits: ['Akses Semua Film', 'Kualitas 4K HDR', 'Tanpa Iklan', 'Bisa Didownload', 'Akses Semua Perangkat'],
    max_devices: 4,
    quality: '4K HDR',
  },
  {
    slug: 'paket_4',
    name: 'Paket 1 Tahun',
    price: 600000,
    duration_months: 12,
    benefits: ['Akses Semua Film', 'Kualitas 4K HDR', 'Tanpa Iklan', 'Bisa Didownload', 'Akses Semua Perangkat'],
    max_devices: 4,
    quality: '4K HDR',
  },
];

// ==================== SEED FUNCTIONS ====================

async function seedGenres() {
  console.log('🎬 Seeding genres...');
  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: genre,
    });
  }
  console.log(`   ✅ ${genres.length} genres seeded`);
}

async function seedSuperAdmin() {
  console.log('👑 Seeding super admin...');

  const email = 'superadmin@sinea.id';
  const password = 'SuperAdmin@2026';
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
    },
    create: {
      name: 'Super Admin',
      email,
      password: hashedPassword,
      role: 'superadmin',
      email_verified_at: new Date(),
    },
  });

  console.log(`   ✅ Super admin seeded (${email})`);
}

async function seedAdmin() {
  console.log('👤 Seeding admin biasa...');

  const email = 'admin@sinea.id';
  const password = 'Admin@2026';
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Admin',
      email,
      password: hashedPassword,
      role: 'admin',
      email_verified_at: new Date(),
    },
  });

  console.log(`   ✅ Admin seeded (${email})`);
}

async function seedMembershipPlans() {
  console.log('💳 Seeding membership plans...');

  for (const plan of membershipPlans) {
    await prisma.membershipPlan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        price: plan.price,
        duration_months: plan.duration_months,
        benefits: plan.benefits,
        max_devices: plan.max_devices,
        quality: plan.quality,
      },
      create: plan,
    });
  }

  console.log(`   ✅ ${membershipPlans.length} membership plans seeded`);
}

async function seedDummyUsers() {
  console.log('👥 Seeding dummy test users...');
  for (let i = 1; i <= 10; i++) {
    const email = `dummy.sinea${i}@gmail.com`;
    const password = `dummysinea${i}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'subscriber', // subscriber so they can stream without paying
        email_verified_at: new Date(),
      },
      create: {
        name: `Dummy Sinea ${i}`,
        email,
        password: hashedPassword,
        role: 'subscriber',
        email_verified_at: new Date(),
      },
    });
  }
  console.log('   ✅ 10 dummy test users seeded (dummy.sinea1@gmail.com s/d dummy.sinea10@gmail.com)');
}

// ==================== MAIN ====================

async function main() {
  console.log('\n🌱 Starting seed...\n');

  await seedGenres();
  await seedSuperAdmin();
  await seedAdmin();
  await seedMembershipPlans();
  await seedDummyUsers();

  console.log('\n✅ Seed completed!\n');
  console.log('📋 Akun yang tersedia:');
  console.log('   Super Admin : superadmin@sinea.id / SuperAdmin@2026');
  console.log('   Admin Biasa : admin@sinea.id / Admin@2026');
  console.log('   Dummy Users : dummy.sinea1@gmail.com (dummysinea1) s/d dummy.sinea10@gmail.com (dummysinea10)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
