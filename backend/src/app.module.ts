import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CryptoModule } from './crypto/crypto.module';

/**
 * AppModule
 *
 * Root module of the application that orchestrates all feature modules.
 *
 * Imports:
 * - ConfigModule: Manages environment variables globally
 * - PrismaModule: Provides database access throughout the app
 * - CryptoModule: Handles cryptocurrency data management
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
    // Cryptocurrency data module
    CryptoModule,
  ],
})
export class AppModule {}
