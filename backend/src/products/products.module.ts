import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

import { Product, ProductSchema } from './schemas/product.schema.js';

import { CategoriesModule } from '../categories/categories.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),

    CategoriesModule,
    AuthModule,
  ],

  controllers: [ProductsController],
  providers: [ProductsService],

  exports: [ProductsService],
})
export class ProductsModule {}
