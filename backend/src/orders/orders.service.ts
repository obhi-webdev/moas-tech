import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Order, OrderDocument } from './schemas/order.schema.js';

import {
  Product,
  ProductDocument,
} from '../products/schemas/product.schema.js';

import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderQueryDto } from './dto/order-query.dto.js';

import { SettingsService } from '../settings/settings.service.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,

    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

    private readonly settingsService: SettingsService,
  ) {}

  // =========================================
  // ORDER NUMBER
  // =========================================

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(1000 + Math.random() * 9000);

    return `MT-${timestamp}-${random}`;
  }

  // =========================================
  // CREATE ORDER
  // =========================================

  async create(dto: CreateOrderDto) {
    const orderItems: Array<{
      product: string;
      name: string;
      price: number;
      quantity: number;
      image: string;
    }> = [];

    const deductedStock: Array<{
      productId: string;
      quantity: number;
    }> = [];

    let subtotal = 0;

    try {
      // =====================================
      // PRODUCTS
      // =====================================

      for (const item of dto.items) {
        const product = await this.productModel
          .findOne({
            _id: item.product,
            isActive: true,
          })
          .exec();

        if (!product) {
          throw new NotFoundException(`Product not found: ${item.product}`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}`,
          );
        }

        // Price must always come from database
        const price =
          product.salePrice != null && product.salePrice > 0
            ? product.salePrice
            : product.regularPrice;

        subtotal += price * item.quantity;

        // ===================================
        // ATOMIC STOCK DEDUCTION
        // ===================================

        const updatedProduct = await this.productModel
          .findOneAndUpdate(
            {
              _id: product._id,
              stock: {
                $gte: item.quantity,
              },
            },
            {
              $inc: {
                stock: -item.quantity,
              },
            },
            {
              new: true,
            },
          )
          .exec();

        if (!updatedProduct) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}`,
          );
        }

        deductedStock.push({
          productId: product._id.toString(),
          quantity: item.quantity,
        });

        orderItems.push({
          product: product._id.toString(),
          name: product.name,
          price,
          quantity: item.quantity,
          image: product.images?.[0] || '',
        });
      }

      // =====================================
      // SETTINGS + DELIVERY
      // =====================================

      const settings = await this.settingsService.getSettings();

      const deliveryCharge =
        dto.deliveryArea === 'inside'
          ? Number(settings.deliveryChargeInside ?? 0)
          : Number(settings.deliveryChargeOutside ?? 0);

      // =====================================
      // TOTAL
      // =====================================

      const total = subtotal + deliveryCharge;

      // =====================================
      // CREATE DATABASE ORDER
      // =====================================

      const order = new this.orderModel({
        orderNumber: this.generateOrderNumber(),

        customerName: dto.customerName.trim(),

        phone: dto.phone.trim(),

        email: dto.email?.trim() || '',

        address: dto.address.trim(),

        district: dto.district?.trim() || '',

        deliveryArea: dto.deliveryArea,

        items: orderItems,

        subtotal,

        deliveryCharge,

        total,

        status: 'pending',

        paymentMethod: dto.paymentMethod || 'cod',

        paymentStatus: 'unpaid',

        note: dto.note?.trim() || '',
      });

      const savedOrder = await order.save();

      return {
        message: 'Order placed successfully',
        order: savedOrder,
      };
    } catch (error) {
      // =====================================
      // STOCK ROLLBACK
      // =====================================

      for (const item of deductedStock) {
        await this.productModel
          .findByIdAndUpdate(item.productId, {
            $inc: {
              stock: item.quantity,
            },
          })
          .exec();
      }

      throw error;
    }
  }

  // =========================================
  // ADMIN - ALL ORDERS
  // =========================================

  async findAll(query: OrderQueryDto) {
    const page = Math.max(Number(query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

    const filter: Record<string, unknown> = {};

    if (query.status) {
      filter.status = query.status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      this.orderModel.countDocuments(filter).exec(),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      orders,

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // =========================================
  // ADMIN - ORDER DETAILS
  // =========================================

  async findById(id: string) {
    const order = await this.orderModel.findById(id).lean().exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // =========================================
  // PUBLIC - ORDER TRACKING
  // =========================================

  async findByOrderNumber(orderNumber: string) {
    const order = await this.orderModel
      .findOne({
        orderNumber,
      })
      .lean()
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // =========================================
  // ADMIN - UPDATE STATUS
  // =========================================

  async updateStatus(id: string, status: string) {
    const allowedStatuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];

    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    const order = await this.orderModel.findById(id).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const oldStatus = order.status;
    const newStatus = status;

    // =====================================
    // NO CHANGE
    // =====================================

    if (oldStatus === newStatus) {
      return {
        message: 'Order already has this status',
        order,
      };
    }

    // =====================================
    // CANCEL ORDER
    // RESTORE STOCK
    // =====================================

    if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
      for (const item of order.items) {
        await this.productModel
          .findByIdAndUpdate(item.product, {
            $inc: {
              stock: item.quantity,
            },
          })
          .exec();
      }
    }

    // =====================================
    // REACTIVATE CANCELLED ORDER
    // =====================================

    if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
      const deductedAgain: Array<{
        productId: string;
        quantity: number;
      }> = [];

      try {
        for (const item of order.items) {
          const updatedProduct = await this.productModel
            .findOneAndUpdate(
              {
                _id: item.product,
                stock: {
                  $gte: item.quantity,
                },
              },
              {
                $inc: {
                  stock: -item.quantity,
                },
              },
              {
                new: true,
              },
            )
            .exec();

          if (!updatedProduct) {
            throw new BadRequestException(
              `Insufficient stock for ${item.name}`,
            );
          }

          deductedAgain.push({
            productId: item.product.toString(),
            quantity: item.quantity,
          });
        }
      } catch (error) {
        // Roll back any stock already deducted
        // during reactivation.

        for (const item of deductedAgain) {
          await this.productModel
            .findByIdAndUpdate(item.productId, {
              $inc: {
                stock: item.quantity,
              },
            })
            .exec();
        }

        throw error;
      }
    }

    // =====================================
    // UPDATE ORDER STATUS
    // =====================================

    order.status = newStatus;

    // COD becomes paid after delivery
    if (newStatus === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }

    // Delivered -> another status
    if (
      oldStatus === 'delivered' &&
      newStatus !== 'delivered' &&
      order.paymentMethod === 'cod'
    ) {
      order.paymentStatus = 'unpaid';
    }

    await order.save();

    return {
      message: 'Order status updated successfully',
      order,
    };
  }
}
