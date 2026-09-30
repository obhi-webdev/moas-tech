import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductQueryDto } from './dto/product-query.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // PUBLIC
  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query, false);
  }

  // ADMIN
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllAdmin(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query, true);
  }

  // ADMIN
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  // PUBLIC
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  // ADMIN
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  // ADMIN
  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  // ADMIN
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
