import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  @MinLength(1)
  product: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  @MinLength(2)
  customerName: string;

  @IsString()
  @MinLength(5)
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(5)
  address: string;

  @IsOptional()
  @IsString()
  district?: string;

  // inside = Mymensingh
  // outside = Outside Mymensingh
  @IsIn(['inside', 'outside'])
  deliveryArea: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsIn(['cod'])
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
