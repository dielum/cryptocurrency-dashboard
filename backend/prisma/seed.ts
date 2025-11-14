import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Database Seed Script
 *
 * Initializes the database with default cryptocurrency pairs.
 * Run this script with: npx prisma db seed
 *
 * This will create the three cryptocurrency pairs we're tracking:
 * - ETH/USDC (Ethereum to USD Coin)
 * - ETH/USDT (Ethereum to Tether)
 * - ETH/BTC (Ethereum to Bitcoin)
 */
async function main() {
  console.log('🌱 Starting database seed...');

  const cryptoPairs = [
    {
      symbol: 'ETH/USDC',
      name: 'Ethereum to USD Coin',
      isActive: true,
    },
    {
      symbol: 'ETH/USDT',
      name: 'Ethereum to Tether',
      isActive: true,
    },
    {
      symbol: 'ETH/BTC',
      name: 'Ethereum to Bitcoin',
      isActive: true,
    },
  ];

  console.log('📊 Creating cryptocurrency pairs...');

  for (const pair of cryptoPairs) {
    const created = await prisma.cryptoPair.upsert({
      where: { symbol: pair.symbol },
      update: {
        name: pair.name,
        isActive: pair.isActive,
      },
      create: pair,
    });

    console.log(`  ✓ ${created.symbol} - ${created.name}`);
  }

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

