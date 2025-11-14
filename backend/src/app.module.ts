import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

/**
 * AppModule
 *
 * Root module of the application that orchestrates all feature modules.
 *
 * Imports:
 * - ConfigModule: Manages environment variables globally
 * - PrismaModule: Provides database access throughout the app
 */
@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true, // Cache environment variables for better performance
    }),
    // Global database module
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
