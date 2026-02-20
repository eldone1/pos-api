import { IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleDetailDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @Type(() => Number)
  quantity: number;
}