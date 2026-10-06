import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BannerDocument = HydratedDocument<Banner>;

export enum BannerPosition {
  MAIN = 'main',
  SIDE_ONE = 'side-one',
  SIDE_TWO = 'side-two',
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Banner {
  @Prop({
    required: true,
    enum: Object.values(BannerPosition),
    unique: true,
    index: true,
  })
  position: BannerPosition;

  @Prop({
    required: true,
    trim: true,
  })
  image: string;

  @Prop({
    trim: true,
    default: '',
  })
  imageFileId: string;

  @Prop({
    trim: true,
    default: '/shop',
  })
  link: string;

  @Prop({
    trim: true,
    default: '',
  })
  alt: string;

  @Prop({
    default: true,
  })
  isActive: boolean;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
