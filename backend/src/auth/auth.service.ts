import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { UsersService } from '../users/users.service.js';
import { UserRole, UserStatus } from '../users/schemas/user.schema.js';

import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone number is required');
    }

    if (dto.email) {
      const existing = await this.usersService.findByEmail(dto.email);

      if (existing) {
        throw new ConflictException('Email is already registered');
      }
    }

    if (dto.phone) {
      const existing = await this.usersService.findByPhone(dto.phone);

      if (existing) {
        throw new ConflictException('Phone number is already registered');
      }
    }

    const hashedPassword = await argon2.hash(dto.password);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email?.toLowerCase(),
      phone: dto.phone,
      password: hashedPassword,

      // Development-এর প্রথম account admin রাখছি।
      role: UserRole.ADMIN,
    });

    return {
      message: 'Admin account created successfully',

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const identifier = dto.identifier.trim();

    const user = identifier.includes('@')
      ? await this.usersService.findByEmail(identifier)
      : await this.usersService.findByPhone(identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const passwordMatches = await argon2.verify(user.password, dto.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    const payload = {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      accessToken,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }
}
