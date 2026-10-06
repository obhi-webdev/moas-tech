import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Banner,
  BannerSchema,
} from './schemas/banner.schema.js';

import { BannersController } from './banners.controller.js';
import { BannersService } from './banners.service.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Banner.name,
        schema: BannerSchema,
      },
    ]),

    AuthModule,
  ],

  controllers: [BannersController],

  providers: [BannersService],

  exports: [BannersService],
})
export class BannersModule {}
