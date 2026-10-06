import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ProductsModule } from './products/products.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { BannersModule } from './banners/banners.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
        dbName: 'moas_tech',
      }),
    }),

    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    SettingsModule,
    DashboardModule,
    UploadsModule,
    BannersModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
