import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule
 *
 * Global module that provides PrismaService to the entire application.
 * Being a global module means you don't need to import it in every module.
 *
 * Usage:
 * - Import PrismaModule once in AppModule
 * - Inject PrismaService in any service across the application
 *
 * Example:
 * ```typescript
 * constructor(private prisma: PrismaService) {}
 * ```
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
