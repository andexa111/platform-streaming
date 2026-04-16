require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'verify.me@domain.com' } });
  if (!user) return console.log("USER_NOT_FOUND");
  const token = await prisma.emailToken.findFirst({ where: { userId: user.id } });
  console.log('TOKEN_IS:', token.token);
  process.exit(0);
}
main();
