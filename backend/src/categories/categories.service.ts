import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Category,
  CategoryDocument,
} from './schemas/category.schema.js';

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

  // =========================================
  // VALIDATE PARENT CATEGORY
  // Only one level:
  // Category -> Subcategory
  // =========================================

  private async validateParentCategory(
    parentCategory?: string | null,
    currentCategoryId?: string,
  ) {
    if (!parentCategory) {
      return null;
    }

    if (!Types.ObjectId.isValid(parentCategory)) {
      throw new BadRequestException(
        'Invalid parent category',
      );
    }

    if (
      currentCategoryId &&
      parentCategory === currentCategoryId
    ) {
      throw new BadRequestException(
        'A category cannot be its own parent',
      );
    }

    const parent = await this.categoryModel
      .findById(parentCategory)
      .exec();

    if (!parent) {
      throw new NotFoundException(
        'Parent category not found',
      );
    }

    // Prevent:
    // Category -> Subcategory -> Sub-subcategory
    if (parent.parentCategory) {
      throw new BadRequestException(
        'A subcategory cannot be used as a parent category',
      );
    }

    return parent._id;
  }

  // =========================================
  // CREATE
  // =========================================

  async create(dto: CreateCategoryDto) {
    const slug = this.createSlug(dto.name);

    const existing = await this.categoryModel.findOne({
      $or: [{ name: dto.name }, { slug }],
    });

    if (existing) {
      throw new ConflictException(
        'Category already exists',
      );
    }

    const parentCategory =
      await this.validateParentCategory(
        dto.parentCategory,
      );

    const category = new this.categoryModel({
      ...dto,
      slug,
      parentCategory,
    });

    return category.save();
  }

  // =========================================
  // GET ALL
  // =========================================

  async findAll(admin = false) {
    const filter = admin
      ? {}
      : { isActive: true };

    return this.categoryModel
      .find(filter)
      .populate(
        'parentCategory',
        'name slug image isActive',
      )
      .sort({
        sortOrder: 1,
        name: 1,
      })
      .lean()
      .exec();
  }

  // =========================================
  // GET MAIN CATEGORIES
  // =========================================

  async findMainCategories(admin = false) {
    const filter = admin
      ? {
          parentCategory: null,
        }
      : {
          parentCategory: null,
          isActive: true,
        };

    return this.categoryModel
      .find(filter)
      .sort({
        sortOrder: 1,
        name: 1,
      })
      .lean()
      .exec();
  }

  // =========================================
  // GET SUBCATEGORIES
  // =========================================

  async findSubcategories(
    parentId: string,
    admin = false,
  ) {
    if (!Types.ObjectId.isValid(parentId)) {
      throw new BadRequestException(
        'Invalid parent category',
      );
    }

    const parentExists =
      await this.categoryModel.exists({
        _id: parentId,
      });

    if (!parentExists) {
      throw new NotFoundException(
        'Parent category not found',
      );
    }

    const filter = admin
      ? {
          parentCategory:
            new Types.ObjectId(parentId),
        }
      : {
          parentCategory:
            new Types.ObjectId(parentId),
          isActive: true,
        };

    return this.categoryModel
      .find(filter)
      .sort({
        sortOrder: 1,
        name: 1,
      })
      .lean()
      .exec();
  }

  // =========================================
  // GET BY SLUG
  // =========================================

  async findBySlug(slug: string) {
    const category = await this.categoryModel
      .findOne({
        slug,
        isActive: true,
      })
      .populate(
        'parentCategory',
        'name slug image',
      )
      .lean()
      .exec();

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    return category;
  }

  // =========================================
  // GET BY ID
  // =========================================

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        'Invalid category ID',
      );
    }

    const category = await this.categoryModel
      .findById(id)
      .populate(
        'parentCategory',
        'name slug image isActive',
      )
      .exec();

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    return category;
  }

  // =========================================
  // UPDATE
  // =========================================

  async update(
    id: string,
    dto: UpdateCategoryDto,
  ) {
    const currentCategory =
      await this.findById(id);

    const updateData: Record<string, unknown> = {
      ...dto,
    };

    if (dto.name) {
      const slug = this.createSlug(dto.name);

      const duplicate =
        await this.categoryModel.findOne({
          _id: { $ne: id },
          $or: [
            { name: dto.name },
            { slug },
          ],
        });

      if (duplicate) {
        throw new ConflictException(
          'Category already exists',
        );
      }

      updateData.slug = slug;
    }

    // Only validate parent if the field
    // was actually included in request
    if (
      Object.prototype.hasOwnProperty.call(
        dto,
        'parentCategory',
      )
    ) {
      const parentCategory =
        await this.validateParentCategory(
          dto.parentCategory,
          id,
        );

      // A main category that already has children
      // cannot itself become a subcategory.
      if (parentCategory) {
        const hasChildren =
          await this.categoryModel.exists({
            parentCategory:
              currentCategory._id,
          });

        if (hasChildren) {
          throw new BadRequestException(
            'This category has subcategories and cannot become a subcategory',
          );
        }
      }

      updateData.parentCategory =
        parentCategory;
    }

    return this.categoryModel
      .findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        },
      )
      .populate(
        'parentCategory',
        'name slug image isActive',
      )
      .exec();
  }

  // =========================================
  // DELETE
  // =========================================

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        'Invalid category ID',
      );
    }

    const category =
      await this.categoryModel
        .findById(id)
        .exec();

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    const hasChildren =
      await this.categoryModel.exists({
        parentCategory: category._id,
      });

    if (hasChildren) {
      throw new BadRequestException(
        'Delete or move the subcategories before deleting this category',
      );
    }

    await category.deleteOne();

    return {
      message:
        'Category deleted successfully',
    };
  }
}
