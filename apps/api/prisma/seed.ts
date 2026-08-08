import { PrismaClient, Role } from '@prisma/client';
import argon2 from 'argon2';

process.loadEnvFile('.env');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('ChangeMe123!');
  await prisma.user.upsert({
    where: { email: 'admin@example.test' },
    update: {
      passwordHash,
      phone: '+8801712345678',
      role: Role.ADMIN,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: 'admin@example.test',
      phone: '+8801712345678',
      passwordHash,
      role: Role.ADMIN,
      emailVerifiedAt: new Date(),
    },
  });
  console.log('Seeded development admin: admin@example.test');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
