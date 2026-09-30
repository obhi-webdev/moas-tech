import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { SettingsService } from './settings.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Public website settings
  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  // Admin update
  @Patch()
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(dto);
  }
}
