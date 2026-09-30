import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Setting, SettingDocument } from './schemas/setting.schema.js';

import { UpdateSettingsDto } from './dto/update-settings.dto.js';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Setting.name)
    private readonly settingModel: Model<SettingDocument>,
  ) {}

  async getSettings() {
    let settings = await this.settingModel.findOne().lean().exec();

    if (!settings) {
      settings = (
        await this.settingModel.create({
          siteName: 'MOAS Tech',
          phone: '01614106550',
          whatsapp: '01614106550',
          address: 'Mymensingh, Bangladesh',
          primaryColor: 'blue',
          secondaryColor: 'orange',
        })
      ).toObject();
    }

    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    let settings = await this.settingModel.findOne().exec();

    if (!settings) {
      settings = await this.settingModel.create(dto);
    } else {
      Object.assign(settings, dto);
      await settings.save();
    }

    return {
      message: 'Settings updated successfully',
      settings,
    };
  }
}
