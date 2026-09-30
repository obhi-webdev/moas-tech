import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ])
  status: string;
}
