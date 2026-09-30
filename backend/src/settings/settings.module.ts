import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Setting, SettingSchema } from './schemas/setting.schema.js';

import { SettingsController } from './settings.controller.js';
import { SettingsService } from './settings.service.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Setting.name,
        schema: SettingSchema,
      },
    ]),

    AuthModule,
  ],

  controllers: [SettingsController],

  providers: [SettingsService],

  exports: [SettingsService],
})
export class SettingsModule {}
