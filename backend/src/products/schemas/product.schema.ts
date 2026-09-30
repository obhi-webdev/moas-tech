import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

// ==========================================
// PRODUCT SPECIFICATION
// ==========================================

@Schema({
  _id: false,
})
export class ProductSpecification {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  key: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  value: string;
}

const ProductSpecificationSchema =
  SchemaFactory.createForClass(ProductSpecification);

// ==========================================
// PRODUCT
// ==========================================

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Product {
  // Product Name
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name: string;

  // URL Slug
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  slug: string;

  // SKU
  @Prop({
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  })
  sku: string;

  // Category
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  })
  category: Types.ObjectId;

  // Brand
  @Prop({
    type: String,
    trim: true,
    default: '',
    index: true,
  })
  brand: string;

  // Product Images
  @Prop({
    type: [String],
    default: [],
  })
  images: string[];

  // Regular Price
  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  regularPrice: number;

  // Sale / Discount Price
  @Prop({
    type: Number,
    min: 0,
    default: null,
  })
  salePrice?: number | null;

  // Stock Quantity
  @Prop({
    type: Number,
    default: 0,
    min: 0,
    index: true,
  })
  stock: number;

  // Short Description
  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  shortDescription: string;

  // Full Description
  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  description: string;

  // Specifications
  @Prop({
    type: [ProductSpecificationSchema],
    default: [],
  })
  specifications: ProductSpecification[];

  // Product Active / Inactive
  @Prop({
    type: Boolean,
    default: true,
    index: true,
  })
  isActive: boolean;

  // Featured Product
  @Prop({
    type: Boolean,
    default: false,
    index: true,
  })
  isFeatured: boolean;

  // New Arrival
  @Prop({
    type: Boolean,
    default: false,
  })
  isNewArrival: boolean;

  // Offer Product
  @Prop({
    type: Boolean,
    default: false,
  })
  isOffer: boolean;

  // Sorting Priority
  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  sortOrder: number;
}

// ==========================================
// CREATE SCHEMA
// ==========================================

export const ProductSchema = SchemaFactory.createForClass(Product);

// ==========================================
// DATABASE INDEXES
// ==========================================

// Category listing
ProductSchema.index({
  isActive: 1,
  category: 1,
  sortOrder: 1,
});

// Featured products
ProductSchema.index({
  isActive: 1,
  isFeatured: 1,
  createdAt: -1,
});

// Search
ProductSchema.index({
  name: 'text',
  brand: 'text',
  sku: 'text',
});
