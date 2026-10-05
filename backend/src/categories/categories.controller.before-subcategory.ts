import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // =========================================
  // PUBLIC - GET ACTIVE CATEGORIES
  // =========================================

  @Get()
  findAll() {
    return this.categoriesService.findAll(false);
  }

  // =========================================
  // ADMIN - GET ALL CATEGORIES
  // =========================================

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllAdmin() {
    return this.categoriesService.findAll(true);
  }

  // =========================================
  // ADMIN - GET CATEGORY BY ID
  // IMPORTANT: Must stay before @Get(':slug')
  // =========================================

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOneAdmin(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  // =========================================
  // PUBLIC - GET CATEGORY BY SLUG
  // =========================================

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  // =========================================
  // ADMIN - CREATE CATEGORY
  // =========================================

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  // =========================================
  // ADMIN - UPDATE CATEGORY
  // =========================================

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  // =========================================
  // ADMIN - DELETE CATEGORY
  // =========================================

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
