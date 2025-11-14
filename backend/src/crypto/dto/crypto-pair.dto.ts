import { IsString, IsBoolean, IsOptional } from 'class-validator';

/**
 * CreateCryptoPairDto
 *
 * Data Transfer Object for creating new cryptocurrency pairs
 */
export class CreateCryptoPairDto {
  /**
   * Trading pair symbol (e.g., "ETH/USDC")
   * Must be unique
   */
  @IsString()
  symbol: string;

  /**
   * Full name of the trading pair
   * e.g., "Ethereum to USD Coin"
   */
  @IsString()
  name: string;

  /**
   * Whether this pair should be actively tracked
   * Defaults to true
   */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * UpdateCryptoPairDto
 *
 * Data Transfer Object for updating cryptocurrency pairs
 */
export class UpdateCryptoPairDto {
  /**
   * Full name of the trading pair
   */
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * Whether this pair should be actively tracked
   */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
