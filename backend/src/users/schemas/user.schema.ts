import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true,
  })
  email?: string;

  @Prop({
    trim: true,
    unique: true,
    sparse: true,
  })
  phone?: string;

  @Prop({
    required: true,
    select: false,
  })
  password: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
