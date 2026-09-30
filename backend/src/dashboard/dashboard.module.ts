import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Product, ProductSchema } from '../products/schemas/product.schema.js';

import { Order, OrderSchema } from '../orders/schemas/order.schema.js';

import { AuthModule } from '../auth/auth.module.js';

import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Order.name,
        schema: OrderSchema,
      },
    ]),

    AuthModule,
  ],

  controllers: [DashboardController],

  providers: [DashboardService],
})
export class DashboardModule {}
