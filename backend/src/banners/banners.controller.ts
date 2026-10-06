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

import { BannersService } from './banners.service.js';

import { CreateBannerDto } from './dto/create-banner.dto.js';
import { UpdateBannerDto } from './dto/update-banner.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@Controller('banners')
export class BannersController {
  constructor(
    private readonly bannersService: BannersService,
  ) {}

  // PUBLIC
  @Get()
  findPublic() {
    return this.bannersService.findPublic();
  }

  // ADMIN - ALL BANNERS
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll() {
    return this.bannersService.findAll();
  }

  // ADMIN - SINGLE BANNER
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOne(@Param('id') id: string) {
    return this.bannersService.findById(id);
  }

  // ADMIN - CREATE
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  // ADMIN - UPDATE
  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
  ) {
    return this.bannersService.update(id, dto);
  }

  // ADMIN - DELETE
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}
