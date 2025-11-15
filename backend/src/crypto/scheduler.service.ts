import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataService } from './data.service';

/**
 * SchedulerService
 *
 * Handles scheduled tasks for cryptocurrency data processing.
 * Runs periodic calculations and maintenance operations.
 *
 * Main responsibilities:
 * - Calculate hourly averages every hour for all active pairs
 * - Can be extended for other scheduled tasks (cleanup, reports, etc.)
 */
@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly dataService: DataService) {}

  /**
   * Calculate hourly averages for all crypto pairs
   * Runs at the start of every hour (HH:00:00)
   *
   * @cron 0 * * * * - At minute 0 of every hour
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'calculateHourlyAverages',
    timeZone: 'UTC',
  })
  async handleHourlyAverageCalculation() {
    this.logger.log('⏰ Starting hourly average calculation...');

    try {
      // Get all active pairs
      const pairs = await this.dataService.getActivePairs();

      // Calculate average for each pair
      const calculations = pairs.map(async (pair) => {
        try {
          const result = await this.dataService.calculateHourlyAverage(
            pair.symbol,
          );

          if (result) {
            this.logger.log(
              `✓ Calculated hourly average for ${pair.symbol}: ${result.average.toFixed(2)}`,
            );
          } else {
            this.logger.warn(
              `⚠️  No data available for ${pair.symbol} hourly average`,
            );
          }

          return result;
        } catch (error) {
          this.logger.error(
            `Failed to calculate hourly average for ${pair.symbol}`,
            error instanceof Error ? error.stack : String(error),
          );
          return null;
        }
      });

      // Wait for all calculations to complete
      const results = await Promise.all(calculations);
      const successful = results.filter((r) => r !== null).length;

      this.logger.log(
        `✅ Hourly average calculation completed: ${successful}/${pairs.length} successful`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to execute hourly average calculation',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Calculate hourly average for the previous hour on startup
   * This ensures we have data for the current hour even if the app just started
   */
  onModuleInit() {
    this.logger.log('🚀 Scheduler service initialized');
    this.logger.log('⏰ Next hourly calculation at: top of next hour (UTC)');

    // Calculate averages for the previous hour on startup
    // This is helpful if the app restarts mid-hour
    setTimeout(() => {
      void this.calculateInitialAverages();
    }, 5000); // Wait 5 seconds after startup to allow data collection
  }

  /**
   * Calculate initial hourly averages on startup
   */
  private async calculateInitialAverages() {
    this.logger.log('📊 Calculating initial hourly averages...');

    const pairs = await this.dataService.getActivePairs();

    for (const pair of pairs) {
      try {
        // Calculate for current hour
        await this.dataService.calculateHourlyAverage(pair.symbol);
      } catch (error) {
        this.logger.error(
          `Failed initial hourly average for ${pair.symbol}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    this.logger.log('✅ Initial hourly averages calculation completed');
  }
}
