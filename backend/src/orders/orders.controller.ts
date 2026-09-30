import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { OrdersService } from './orders.service.js';

import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderQueryDto } from './dto/order-query.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Customer checkout
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  // Admin: all orders
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  // Admin: single order
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  // Admin: change order status
  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }

  // Customer can check an order by order number
  @Get('track/:orderNumber')
  trackOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }
}
