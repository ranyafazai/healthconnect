import prisma from './prisma';

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected to MySQL successfully!');
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Prisma connection error:', error);
  }
}

testConnection();