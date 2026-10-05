import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Category {
  @Prop({
    required: true,
    trim: true,
    unique: true,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  })
  slug: string;

  @Prop({
    trim: true,
    default: '',
  })
  description: string;

  @Prop({
    trim: true,
    default: '',
  })
  image: string;

  @Prop({
    default: true,
  })
  isActive: boolean;

  @Prop({
    default: 0,
    min: 0,
  })
  sortOrder: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ isActive: 1, sortOrder: 1 });
