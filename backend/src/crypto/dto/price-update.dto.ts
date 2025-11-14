import { IsString, IsNumber, IsOptional, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * PriceUpdateDto
 *
 * Data Transfer Object for price updates
 * Used when receiving price data from external sources (Finnhub)
 * or sending price updates to frontend clients
 */
export class PriceUpdateDto {
  /**
   * Trading pair symbol (e.g., "ETH/USDC")
   */
  @IsString()
  symbol: string;

  /**
   * Current price value
   */
  @IsNumber()
  @Min(0)
  price: number;

  /**
   * Trading volume (optional)
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume?: number;

  /**
   * Timestamp of the price update
   */
  @IsDate()
  @Type(() => Date)
  timestamp: Date;
}

