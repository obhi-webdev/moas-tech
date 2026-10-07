import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import ImageKit from '@imagekit/nodejs';

import {
  Setting,
  SettingDocument,
} from './schemas/setting.schema.js';

import { UpdateSettingsDto } from './dto/update-settings.dto.js';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Setting.name)
    private readonly settingModel: Model<SettingDocument>,
  ) {}

  private getImageKit() {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    if (!privateKey) {
      return null;
    }

    return new ImageKit({
      privateKey,
    });
  }

  private async deleteImageKitFile(
    fileId?: string | null,
  ) {
    if (!fileId) return;

    const imagekit = this.getImageKit();

    if (!imagekit) {
      console.error(
        'IMAGEKIT_PRIVATE_KEY is missing. Old logo was not deleted.',
      );

      return;
    }

    try {
      await imagekit.files.delete(fileId);

      console.log(
        `Old logo deleted from ImageKit: ${fileId}`,
      );
    } catch (error) {
      console.error(
        `Failed to delete old ImageKit logo: ${fileId}`,
        error,
      );
    }
  }

  async getSettings() {
    let settings =
      await this.settingModel.findOne().lean().exec();

    if (!settings) {
      settings = (
        await this.settingModel.create({
          siteName: 'VC Tech',
          phone: '+8809696492358',
          whatsapp: '8809696492358',
          address: 'Mymensingh, Bangladesh',
          primaryColor: 'blue',
          secondaryColor: 'orange',
          logo: '',
          logoFileId: '',
        })
      ).toObject();
    }

    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    let settings =
      await this.settingModel.findOne().exec();

    const oldLogo = settings?.logo || '';
    const oldLogoFileId =
      settings?.logoFileId || '';

    const logoIsChanging =
      typeof dto.logo === 'string' &&
      dto.logo !== oldLogo;

    if (!settings) {
      settings =
        await this.settingModel.create(dto);
    } else {
      Object.assign(settings, dto);
      await settings.save();
    }

    if (
      logoIsChanging &&
      oldLogoFileId &&
      oldLogoFileId !== settings.logoFileId
    ) {
      await this.deleteImageKitFile(
        oldLogoFileId,
      );
    }

    return {
      message: 'Settings updated successfully',
      settings,
    };
  }
}
