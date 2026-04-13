import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

// Setup Prisma client dengan adapter pg (Prisma v7)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ==================== DATA GENRE ====================

const genres = [
  { name: 'Comedy', slug: 'comedy' },
  { name: 'Horror', slug: 'horror' },
  { name: 'Action', slug: 'action' },
  { name: 'Historical', slug: 'historical' },
  { name: 'Drama', slug: 'drama' },
];

// ==================== SEED FUNCTIONS ====================

async function seedGenres() {
  console.log('🎬 Seeding genres...');

  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {}, // Kalau sudah ada, skip
      create: genre,
    });
  }

  console.log(`   ✅ ${genres.length} genres seeded`);
}

async function seedSuperAdmin() {
  console.log('👤 Seeding super admin...');

  const email = process.env.ADMIN_EMAIL || 'admin@lalakon.id';
  const password = process.env.ADMIN_PASSWORD || 'admin12345';

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {}, // Kalau sudah ada, skip
    create: {
      name: 'Super Admin',
      email,
      password: hashedPassword,
      role: 'superadmin',
      email_verified_at: new Date(), // Langsung verified
    },
  });

  console.log(`   ✅ Super admin seeded (${email})`);
}

// ==================== MAIN ====================

async function main() {
  console.log('\n🌱 Starting seed...\n');

  await seedGenres();
  await seedSuperAdmin();

  console.log('\n✅ Seed completed!\n');
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
