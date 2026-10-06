import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import ImageKit from '@imagekit/nodejs';

import {
  Banner,
  BannerDocument,
} from './schemas/banner.schema.js';

import { CreateBannerDto } from './dto/create-banner.dto.js';
import { UpdateBannerDto } from './dto/update-banner.dto.js';

@Injectable()
export class BannersService {
  constructor(
    @InjectModel(Banner.name)
    private readonly bannerModel: Model<BannerDocument>,
  ) {}

  // =========================================
  // IMAGEKIT
  // =========================================

  private getImageKit() {
    const privateKey =
      process.env.IMAGEKIT_PRIVATE_KEY;

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
    if (!fileId) {
      return;
    }

    const imagekit = this.getImageKit();

    if (!imagekit) {
      console.error(
        'IMAGEKIT_PRIVATE_KEY is missing. Old banner image was not deleted.',
      );

      return;
    }

    try {
      await imagekit.files.delete(fileId);

      console.log(
        `Old banner image deleted from ImageKit: ${fileId}`,
      );
    } catch (error) {
      /*
       * Do not fail the banner update/delete if
       * ImageKit cleanup fails.
       *
       * MongoDB remains the source of truth and
       * cleanup can be handled separately.
       */
      console.error(
        `Failed to delete ImageKit banner image: ${fileId}`,
        error,
      );
    }
  }

  // =========================================
  // CREATE
  // =========================================

  async create(dto: CreateBannerDto) {
    const existing = await this.bannerModel
      .findOne({
        position: dto.position,
      })
      .exec();

    if (existing) {
      throw new ConflictException(
        `Banner position "${dto.position}" already exists`,
      );
    }

    const banner = new this.bannerModel(dto);

    return banner.save();
  }

  // =========================================
  // PUBLIC
  // =========================================

  async findPublic() {
    return this.bannerModel
      .find()
      .sort({
        createdAt: 1,
      })
      .lean()
      .exec();
  }

  // =========================================
  // ADMIN
  // =========================================

  async findAll() {
    return this.bannerModel
      .find()
      .sort({
        createdAt: 1,
      })
      .lean()
      .exec();
  }

  async findById(id: string) {
    const banner = await this.bannerModel
      .findById(id)
      .exec();

    if (!banner) {
      throw new NotFoundException(
        'Banner not found',
      );
    }

    return banner;
  }

  // =========================================
  // UPDATE
  // =========================================

  async update(
    id: string,
    dto: UpdateBannerDto,
  ) {
    const existingBanner =
      await this.findById(id);

    if (dto.position) {
      const duplicate =
        await this.bannerModel
          .findOne({
            _id: {
              $ne: id,
            },

            position: dto.position,
          })
          .exec();

      if (duplicate) {
        throw new ConflictException(
          `Banner position "${dto.position}" already exists`,
        );
      }
    }

    const oldImageFileId =
      existingBanner.imageFileId;

    const imageIsChanging =
      typeof dto.image === 'string' &&
      dto.image !== existingBanner.image;

    const banner =
      await this.bannerModel
        .findByIdAndUpdate(
          id,
          {
            ...dto,
          },
          {
            new: true,
            runValidators: true,
          },
        )
        .exec();

    if (!banner) {
      throw new NotFoundException(
        'Banner not found',
      );
    }

    /*
     * Delete old ImageKit image ONLY AFTER
     * MongoDB update succeeds.
     *
     * Also make sure we do not accidentally
     * delete the same ImageKit file.
     */
    if (
      imageIsChanging &&
      oldImageFileId &&
      oldImageFileId !==
        banner.imageFileId
    ) {
      await this.deleteImageKitFile(
        oldImageFileId,
      );
    }

    return banner;
  }

  // =========================================
  // DELETE
  // =========================================

  async remove(id: string) {
    const banner =
      await this.bannerModel
        .findByIdAndDelete(id)
        .exec();

    if (!banner) {
      throw new NotFoundException(
        'Banner not found',
      );
    }

    if (banner.imageFileId) {
      await this.deleteImageKitFile(
        banner.imageFileId,
      );
    }

    return {
      message:
        'Banner deleted successfully',
    };
  }
}
