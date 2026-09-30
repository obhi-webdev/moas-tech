import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Product, ProductDocument } from './schemas/product.schema.js';

import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductQueryDto } from './dto/product-query.dto.js';

import { CategoriesService } from '../categories/categories.service.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

    private readonly categoriesService: CategoriesService,
  ) {}

  private createSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(dto: CreateProductDto) {
    await this.categoriesService.findById(dto.category);

    if (dto.salePrice !== undefined && dto.salePrice > dto.regularPrice) {
      throw new BadRequestException(
        'Sale price cannot be greater than regular price',
      );
    }

    const slug = this.createSlug(dto.name);
    const sku = dto.sku.trim().toUpperCase();

    const duplicate = await this.productModel.findOne({
      $or: [{ slug }, { sku }],
    });

    if (duplicate) {
      throw new ConflictException(
        'Product with this name or SKU already exists',
      );
    }

    return this.productModel.create({
      ...dto,
      slug,
      sku,
    });
  }

  async findAll(query: ProductQueryDto, admin = false) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (!admin) {
      filter.isActive = true;
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.brand) {
      filter.brand = {
        $regex: query.brand.trim(),
        $options: 'i',
      };
    }

    if (query.featured !== undefined) {
      filter.isFeatured = query.featured;
    }

    if (query.offer !== undefined) {
      filter.isOffer = query.offer;
    }

    if (query.search?.trim()) {
      filter.$text = {
        $search: query.search.trim(),
      };
    }

    let sort: Record<string, 1 | -1> = {
      sortOrder: 1,
      createdAt: -1,
    };

    switch (query.sort) {
      case 'price-low':
        sort = {
          salePrice: 1,
          regularPrice: 1,
        };
        break;

      case 'price-high':
        sort = {
          salePrice: -1,
          regularPrice: -1,
        };
        break;

      case 'oldest':
        sort = {
          createdAt: 1,
        };
        break;

      case 'newest':
        sort = {
          createdAt: -1,
        };
        break;
    }

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      this.productModel.countDocuments(filter),
    ]);

    return {
      products,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.productModel
      .findOne({
        slug,
        isActive: true,
      })
      .populate('category', 'name slug')
      .lean()
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findById(id: string) {
    const product = await this.productModel
      .findById(id)
      .populate('category', 'name slug')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.productModel.findById(id).exec();

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    if (dto.category) {
      await this.categoriesService.findById(dto.category);
    }

    const regularPrice = dto.regularPrice ?? existing.regularPrice;

    const salePrice = dto.salePrice ?? existing.salePrice;

    if (
      salePrice !== null &&
      salePrice !== undefined &&
      salePrice > regularPrice
    ) {
      throw new BadRequestException(
        'Sale price cannot be greater than regular price',
      );
    }

    const updateData: Record<string, unknown> = {
      ...dto,
    };

    if (dto.name) {
      updateData.slug = this.createSlug(dto.name);
    }

    if (dto.sku) {
      updateData.sku = dto.sku.trim().toUpperCase();
    }

    const duplicateConditions: Record<string, unknown>[] = [];

    if (updateData.slug) {
      duplicateConditions.push({
        slug: updateData.slug,
      });
    }

    if (updateData.sku) {
      duplicateConditions.push({
        sku: updateData.sku,
      });
    }

    if (duplicateConditions.length > 0) {
      const duplicate = await this.productModel.findOne({
        _id: { $ne: id },
        $or: duplicateConditions,
      });

      if (duplicate) {
        throw new ConflictException('Product name or SKU already exists');
      }
    }

    return this.productModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .populate('category', 'name slug')
      .exec();
  }

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete(id).exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product deleted successfully',
    };
  }
}
