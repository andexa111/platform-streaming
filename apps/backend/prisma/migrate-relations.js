const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting Sinea Metadata Migration...');
  const films = await prisma.film.findMany({
    include: {
      directors: true,
      actors: true,
    },
  });

  for (const film of films) {
    console.log(`Processing film: ${film.title} (ID: ${film.id})`);
    
    // 1. Migrate Director
    if (film.director && film.directors.length === 0) {
      const directorNames = film.director
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);
      
      for (const name of directorNames) {
        // Double check if director already exists for this film or globally
        let directorRecord = await prisma.director.findFirst({
          where: { name }
        });
        
        if (!directorRecord) {
          directorRecord = await prisma.director.create({
            data: { name }
          });
        }
        
        await prisma.film.update({
          where: { id: film.id },
          data: {
            directors: {
              connect: { id: directorRecord.id }
            }
          }
        });
        console.log(`- Connected director "${name}" to film ID ${film.id}`);
      }
    }
  }

  console.log('Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
