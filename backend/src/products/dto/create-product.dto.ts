import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductSpecificationDto {
  @IsString()
  @MinLength(1)
  key: string;

  @IsString()
  @MinLength(1)
  value: string;
}

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  sku: string;

  @IsMongoId()
  category: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  images?: string[];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  regularPrice: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSpecificationDto)
  specifications?: ProductSpecificationDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isNewArrival?: boolean;

  @IsOptional()
  @IsBoolean()
  isOffer?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
