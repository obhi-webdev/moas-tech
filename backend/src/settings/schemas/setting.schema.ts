import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingDocument = HydratedDocument<Setting>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Setting {
  @Prop({
    default: 'VC Tech',
    trim: true,
  })
  siteName: string;

  @Prop({
    default: '01614106550',
    trim: true,
  })
  phone: string;

  @Prop({
    default: '01614106550',
    trim: true,
  })
  whatsapp: string;

  @Prop({
    default: '',
    trim: true,
  })
  email: string;

  @Prop({
    default: 'Mymensingh, Bangladesh',
    trim: true,
  })
  address: string;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  deliveryChargeInside: number;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  deliveryChargeOutside: number;

  @Prop({
    default: '',
    trim: true,
  })
  facebook: string;

  @Prop({
    default: '',
    trim: true,
  })
  logo: string;

  @Prop({
    default: 'blue',
  })
  primaryColor: string;

  @Prop({
    default: 'orange',
  })
  secondaryColor: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
