import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsBoolean,
  Min,
  MaxLength,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MaxLength(50)
  sku: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  cost?: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  stock?: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minStock?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID()
  categoryId: string;
}