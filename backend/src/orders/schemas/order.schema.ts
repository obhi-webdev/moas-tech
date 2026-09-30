import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

// =========================================
// ORDER ITEM
// =========================================

@Schema({ _id: false })
export class OrderItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  product: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    min: 0,
  })
  price: number;

  @Prop({
    required: true,
    min: 1,
  })
  quantity: number;

  @Prop({
    default: '',
    trim: true,
  })
  image: string;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

// =========================================
// ORDER
// =========================================

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Order {
  @Prop({
    required: true,
    unique: true,
    index: true,
    trim: true,
  })
  orderNumber: string;

  // =======================================
  // CUSTOMER INFORMATION
  // =======================================

  @Prop({
    required: true,
    trim: true,
  })
  customerName: string;

  @Prop({
    required: true,
    trim: true,
  })
  phone: string;

  @Prop({
    default: '',
    trim: true,
    lowercase: true,
  })
  email: string;

  // =======================================
  // DELIVERY INFORMATION
  // =======================================

  @Prop({
    required: true,
    trim: true,
  })
  address: string;

  @Prop({
    default: '',
    trim: true,
  })
  district: string;

  @Prop({
    enum: ['inside', 'outside'],
    required: true,
  })
  deliveryArea: string;

  // =======================================
  // ORDER ITEMS
  // =======================================

  @Prop({
    type: [OrderItemSchema],
    required: true,
  })
  items: OrderItem[];

  // =======================================
  // PRICE INFORMATION
  // =======================================

  @Prop({
    required: true,
    min: 0,
  })
  subtotal: number;

  @Prop({
    required: true,
    default: 0,
    min: 0,
  })
  deliveryCharge: number;

  @Prop({
    required: true,
    min: 0,
  })
  total: number;

  // =======================================
  // ORDER STATUS
  // =======================================

  @Prop({
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ],
    default: 'pending',
    index: true,
  })
  status: string;

  // =======================================
  // PAYMENT
  // =======================================

  @Prop({
    enum: ['cod', 'bkash', 'nagad'],
    default: 'cod',
  })
  paymentMethod: string;

  @Prop({
    enum: ['unpaid', 'paid'],
    default: 'unpaid',
  })
  paymentStatus: string;

  // =======================================
  // NOTE
  // =======================================

  @Prop({
    default: '',
    trim: true,
  })
  note: string;
}

// =========================================
// SCHEMA
// =========================================

export const OrderSchema = SchemaFactory.createForClass(Order);

// =========================================
// INDEXES
// =========================================

OrderSchema.index({
  createdAt: -1,
});

OrderSchema.index({
  phone: 1,
  createdAt: -1,
});

OrderSchema.index({
  deliveryArea: 1,
  createdAt: -1,
});
