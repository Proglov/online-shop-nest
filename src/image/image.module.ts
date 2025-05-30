import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { ConfigModule } from '@nestjs/config';
import s3StorageConfig from 'src/configs/s3Storage.config';
import { TemporaryImagesModule } from 'src/temporary-images/temporary-images.module';

@Module({
  imports: [
    ConfigModule.forFeature(s3StorageConfig),
    TemporaryImagesModule
  ],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService]
})
export class ImageModule { }
