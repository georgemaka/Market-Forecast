import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sukut.com' },
    update: {},
    create: {
      email: 'admin@sukut.com',
      firstName: 'System',
      lastName: 'Administrator',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      marketSegments: ['ENVIRONMENTAL', 'ENERGY', 'PUBLIC_WORKS', 'RESIDENTIAL'],
    },
  });

  // Create executive user
  const execPasswordHash = await bcrypt.hash('exec123', 12);
  const executive = await prisma.user.upsert({
    where: { email: 'executive@sukut.com' },
    update: {},
    create: {
      email: 'executive@sukut.com',
      firstName: 'John',
      lastName: 'Executive',
      passwordHash: execPasswordHash,
      role: 'EXECUTIVE',
      marketSegments: ['ENVIRONMENTAL', 'ENERGY', 'PUBLIC_WORKS', 'RESIDENTIAL'],
    },
  });

  // Create VP/Director user
  const vpPasswordHash = await bcrypt.hash('vp123', 12);
  const vp = await prisma.user.upsert({
    where: { email: 'vp@sukut.com' },
    update: {},
    create: {
      email: 'vp@sukut.com',
      firstName: 'Jane',
      lastName: 'Director',
      passwordHash: vpPasswordHash,
      role: 'VP_DIRECTOR',
      marketSegments: ['ENVIRONMENTAL', 'ENERGY'],
    },
  });

  // Create contributor user
  const contributorPasswordHash = await bcrypt.hash('user123', 12);
  const contributor = await prisma.user.upsert({
    where: { email: 'contributor@sukut.com' },
    update: {},
    create: {
      email: 'contributor@sukut.com',
      firstName: 'Bob',
      lastName: 'Contributor',
      passwordHash: contributorPasswordHash,
      role: 'CONTRIBUTOR',
      marketSegments: ['ENVIRONMENTAL'],
    },
  });

  // Create a sample forecast period
  const forecastPeriod = await prisma.forecastPeriod.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Q1 2025 Forecast',
      description: 'First quarter 2025 market forecast',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-03-31'),
      submissionDeadline: new Date('2025-01-15'),
      status: 'ACTIVE',
    },
  });

  console.log('✅ Database seed completed!');
  console.log('👤 Test users created:');
  console.log('   Admin: admin@sukut.com / admin123');
  console.log('   Executive: executive@sukut.com / exec123');
  console.log('   VP/Director: vp@sukut.com / vp123');
  console.log('   Contributor: contributor@sukut.com / user123');
  console.log(`📊 Forecast period created: ${forecastPeriod.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });