import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConsoleModule } from './src/console.module';
import { DataService } from './src/crypto/data.service';
import { PrismaService } from './src/prisma/prisma.service';
import * as repl from 'repl';

async function bootstrap() {
  // Use ConsoleModule to avoid WebSocket dependencies
  const app = await NestFactory.createApplicationContext(ConsoleModule);

  // Get services
  const dataService = app.get(DataService);
  const prisma = app.get(PrismaService);

  console.log(
    '\n╔════════════════════════════════════════════════════════════════╗',
  );
  console.log(
    '║        🚀  NESTJS CONSOLE (Similar to Rails Console)  🚀      ║',
  );
  console.log(
    '╚════════════════════════════════════════════════════════════════╝\n',
  );

  console.log('📦 Available services:');
  console.log('  • dataService - DataService instance');
  console.log('  • prisma - PrismaService instance (direct DB access)');
  console.log('  • app - NestJS application context\n');

  console.log('💡 Examples:');
  console.log('  > await dataService.getAllPairs()');
  console.log('  > await prisma.cryptoPair.findMany()');
  console.log('  > await prisma.price.count()');
  console.log('  > await dataService.getCryptoData("ETH/USDC")\n');

  console.log('📝 Type ".exit" or Ctrl+C to quit\n');
  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
  );

  // Create REPL
  const r = repl.start({
    prompt: 'nest> ',
    useColors: true,
    ignoreUndefined: true,
  });

  // Make services available in REPL context
  r.context.dataService = dataService;
  r.context.prisma = prisma;
  r.context.app = app;

  // Cleanup on exit
  r.on('exit', () => {
    void (async () => {
      console.log('\n👋 Closing NestJS application context...');
      await app.close();
      process.exit(0);
    })();
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start console:', error);
  process.exit(1);
});
