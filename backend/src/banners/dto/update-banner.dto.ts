import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { BannerPosition } from '../schemas/banner.schema.js';

export class UpdateBannerDto {
  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;

  @IsOptional()
  @IsString()
  @MinLength(1)
  image?: string;

  @IsOptional()
  @IsString()
  imageFileId?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
