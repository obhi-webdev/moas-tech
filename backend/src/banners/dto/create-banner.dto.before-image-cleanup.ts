import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { BannerPosition } from '../schemas/banner.schema.js';

export class CreateBannerDto {
  @IsEnum(BannerPosition)
  position: BannerPosition;

  @IsString()
  @MinLength(1)
  image: string;

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
