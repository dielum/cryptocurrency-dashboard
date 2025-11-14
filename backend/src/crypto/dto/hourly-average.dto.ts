import { IsString, IsNumber, IsDate, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * HourlyAverageDto
 *
 * Data Transfer Object for hourly average statistics
 * Used when calculating and broadcasting hourly averages to clients
 */
export class HourlyAverageDto {
  /**
   * Trading pair symbol (e.g., "ETH/USDC")
   */
  @IsString()
  symbol: string;

  /**
   * Hour timestamp (rounded to start of hour)
   */
  @IsDate()
  @Type(() => Date)
  hour: Date;

  /**
   * Average price for the hour
   */
  @IsNumber()
  @Min(0)
  average: number;

  /**
   * Highest price in the hour
   */
  @IsNumber()
  @Min(0)
  high: number;

  /**
   * Lowest price in the hour
   */
  @IsNumber()
  @Min(0)
  low: number;

  /**
   * Number of price points used for calculation
   */
  @IsInt()
  @Min(1)
  count: number;
}
