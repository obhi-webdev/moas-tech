import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Product,
  ProductDocument,
} from '../products/schemas/product.schema.js';

import { Order, OrderDocument } from '../orders/schemas/order.schema.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async getStats() {
    const [
      totalProducts,
      activeProducts,
      outOfStockProducts,
      lowStockProducts,

      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,

      salesResult,
      recentOrders,
    ] = await Promise.all([
      // Products
      this.productModel.countDocuments(),

      this.productModel.countDocuments({
        isActive: true,
      }),

      this.productModel.countDocuments({
        stock: 0,
      }),

      this.productModel.countDocuments({
        stock: {
          $gt: 0,
          $lte: 5,
        },
      }),

      // Orders
      this.orderModel.countDocuments(),

      this.orderModel.countDocuments({
        status: 'pending',
      }),

      this.orderModel.countDocuments({
        status: 'confirmed',
      }),

      this.orderModel.countDocuments({
        status: 'processing',
      }),

      this.orderModel.countDocuments({
        status: 'shipped',
      }),

      this.orderModel.countDocuments({
        status: 'delivered',
      }),

      this.orderModel.countDocuments({
        status: 'cancelled',
      }),

      // Revenue
      this.orderModel.aggregate([
        {
          $match: {
            status: 'delivered',
          },
        },
        {
          $group: {
            _id: null,
            totalSales: {
              $sum: '$total',
            },
          },
        },
      ]),

      // Recent orders
      this.orderModel
        .find()
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean()
        .exec(),
    ]);

    const totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0;

    return {
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
      },

      orders: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },

      sales: {
        total: totalSales,
      },

      recentOrders,
    };
  }
}
