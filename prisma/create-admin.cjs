const path = require('node:path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const envPath = path.resolve(process.cwd(), path.basename(process.cwd()) === 'server' ? '../.env' : '.env');
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Restaurant Admin';

  if (!email || !password || password.length < 16) {
    throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 16 characters.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: 'ADMIN', isActive: true, refreshTokenHash: null },
    create: { name, email, passwordHash, role: 'ADMIN', isActive: true },
  });

  console.log(`Admin account is ready for ${email}.`);
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());