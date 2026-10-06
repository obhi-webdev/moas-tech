import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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

  async findPublic() {
    return this.bannerModel
      .find({
        isActive: true,
      })
      .sort({
        createdAt: 1,
      })
      .lean()
      .exec();
  }

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
      throw new NotFoundException('Banner not found');
    }

    return banner;
  }

  async update(id: string, dto: UpdateBannerDto) {
    await this.findById(id);

    if (dto.position) {
      const duplicate = await this.bannerModel
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

    const banner = await this.bannerModel
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
      throw new NotFoundException('Banner not found');
    }

    return banner;
  }

  async remove(id: string) {
    const banner = await this.bannerModel
      .findByIdAndDelete(id)
      .exec();

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    return {
      message: 'Banner deleted successfully',
    };
  }
}
