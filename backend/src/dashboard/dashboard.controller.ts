import { Controller, Get, UseGuards } from '@nestjs/common';

import { DashboardService } from './dashboard.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getStats() {
    return this.dashboardService.getStats();
  }
}
