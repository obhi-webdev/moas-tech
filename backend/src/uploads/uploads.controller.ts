import {
  BadRequestException,
  Controller,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import ImageKit, { toFile } from '@imagekit/nodejs';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@Controller('uploads')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UploadsController {
  @Post('product')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),

      limits: {
        fileSize: 5 * 1024 * 1024,
      },

      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Only JPG, PNG and WEBP images are allowed',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Product image is required',
      );
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    if (!privateKey) {
      throw new InternalServerErrorException(
        'ImageKit configuration is missing',
      );
    }

    try {
      const imagekit = new ImageKit({
        privateKey,
      });

      const safeName = file.originalname
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const extension =
        file.originalname
          .split('.')
          .pop()
          ?.toLowerCase() || 'jpg';

      const fileName =
        `${safeName || 'product'}-${Date.now()}.${extension}`;

      const result = await imagekit.files.upload({
        file: await toFile(file.buffer, file.originalname),
        fileName,
        folder: '/vc-tech/products',
        useUniqueFileName: true,
      });

      if (!result.url) {
        throw new Error('ImageKit did not return an image URL');
      }

      return {
        message: 'Image uploaded successfully',
        image: result.url,
      };
    } catch (error) {
      console.error('ImageKit upload error:', error);

      throw new InternalServerErrorException(
        'Image upload failed',
      );
    }
  }

  @Post('banner')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),

      limits: {
        fileSize: 5 * 1024 * 1024,
      },

      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Only JPG, PNG and WEBP images are allowed',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async uploadBannerImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Banner image is required',
      );
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    if (!privateKey) {
      throw new InternalServerErrorException(
        'ImageKit configuration is missing',
      );
    }

    try {
      const imagekit = new ImageKit({
        privateKey,
      });

      const safeName = file.originalname
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const extension =
        file.originalname
          .split('.')
          .pop()
          ?.toLowerCase() || 'jpg';

      const fileName =
        `${safeName || 'banner'}-${Date.now()}.${extension}`;

      const result = await imagekit.files.upload({
        file: await toFile(
          file.buffer,
          file.originalname,
        ),
        fileName,
        folder: '/vc-tech/banners',
        useUniqueFileName: true,
      });

      if (!result.url) {
        throw new Error(
          'ImageKit did not return an image URL',
        );
      }

      return {
        message: 'Banner image uploaded successfully',
        image: result.url,
        fileId: result.fileId,
      };
    } catch (error) {
      console.error(
        'Banner ImageKit upload error:',
        error,
      );

      throw new InternalServerErrorException(
        'Banner image upload failed',
      );
    }
  }


}
