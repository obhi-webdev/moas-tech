import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Order, OrderSchema } from './schemas/order.schema.js';

import { Product, ProductSchema } from '../products/schemas/product.schema.js';

import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

import { AuthModule } from '../auth/auth.module.js';
import { SettingsModule } from '../settings/settings.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),

    AuthModule,
    SettingsModule,
  ],

  controllers: [OrdersController],

  providers: [OrdersService],

  exports: [OrdersService],
})
export class OrdersModule {}
