import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  User,
  UserDocument,
  UserRole,
  UserStatus,
} from './schemas/user.schema.js';

interface CreateUserData {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string) {
    return this.userModel
      .findOne({
        email: email.toLowerCase(),
      })
      .select('+password')
      .exec();
  }

  async findByPhone(phone: string) {
    return this.userModel.findOne({ phone }).select('+password').exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async create(data: CreateUserData) {
    const user = new this.userModel({
      ...data,
      role: data.role ?? UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    });

    return user.save();
  }
}
