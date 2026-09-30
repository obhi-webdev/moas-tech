import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Category, CategoryDocument } from './schemas/category.schema.js';

import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  private createSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(dto: CreateCategoryDto) {
    const slug = this.createSlug(dto.name);

    const existing = await this.categoryModel.findOne({
      $or: [{ name: dto.name }, { slug }],
    });

    if (existing) {
      throw new ConflictException('Category already exists');
    }

    const category = new this.categoryModel({
      ...dto,
      slug,
    });

    return category.save();
  }

  async findAll(admin = false) {
    const filter = admin ? {} : { isActive: true };

    return this.categoryModel
      .find(filter)
      .sort({
        sortOrder: 1,
        name: 1,
      })
      .lean()
      .exec();
  }

  async findBySlug(slug: string) {
    const category = await this.categoryModel
      .findOne({
        slug,
        isActive: true,
      })
      .lean()
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findById(id: string) {
    const category = await this.categoryModel.findById(id).exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);

    const updateData: Record<string, unknown> = {
      ...dto,
    };

    if (dto.name) {
      const slug = this.createSlug(dto.name);

      const duplicate = await this.categoryModel.findOne({
        _id: { $ne: id },
        $or: [{ name: dto.name }, { slug }],
      });

      if (duplicate) {
        throw new ConflictException('Category already exists');
      }

      updateData.slug = slug;
    }

    return this.categoryModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  async remove(id: string) {
    const category = await this.categoryModel.findByIdAndDelete(id).exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'Category deleted successfully',
    };
  }
}
