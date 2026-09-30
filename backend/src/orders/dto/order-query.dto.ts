import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class OrderQueryDto {
  @IsOptional()
  @IsIn([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ])
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
