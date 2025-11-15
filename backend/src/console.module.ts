import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DataService } from './crypto/data.service';
import { ScheduleModule } from '@nestjs/schedule';

/**
 * ConsoleModule
 *
 * Simplified module for console access.
 * Excludes services that require HTTP/WebSocket server.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    PrismaModule,
    ScheduleModule.forRoot(),
  ],
  providers: [DataService],
  exports: [DataService],
})
export class ConsoleModule {}
