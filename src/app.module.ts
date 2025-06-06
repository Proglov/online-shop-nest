import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import appConfig from './configs/app.config';
import databaseConfig from './configs/database.config';
import corsConfig from './configs/cors.config';
import environmentValidation from './configs/environment.validation';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './auth/guards/authentication.guard';
import { AdminGuard } from './admin/admin.guard';
import { JWTAuthGuard } from './auth/guards/jwt-auth.guard';
import { ImageModule } from './image/image.module';
import { TemporaryImagesModule } from './temporary-images/temporary-images.module';
import { ProductModule } from './product/product.module';
import { NoteModule } from './note/note.module';
import { BrandModule } from './brand/brand.module';
import { CommentModule } from './comment/comment.module';
import { TransactionModule } from './transaction/transaction.module';
import { FestivalModule } from './discount-festival/festival.module';
import { ArticleModule } from './article/article.module';
import { CronjobModule } from './cronjob/cronjob.module';
import { FirebaseModule } from './firebase/firebase.module';
import { EmailModule } from './email/email.module';
import { EmailOTPModule } from './email-otp/email-otp.module';
import { PaymentModule } from './payment/payment.module';
import apiConfig from './configs/api.config';


const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, corsConfig, apiConfig],
      validationSchema: environmentValidation,
      cache: ENV === 'production'
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('database.URI')
      })
    }),
    CronjobModule,
    UsersModule,
    AuthModule,
    AdminModule,
    EmailModule,
    ImageModule,
    TemporaryImagesModule,
    ProductModule,
    NoteModule,
    BrandModule,
    CommentModule,
    TransactionModule,
    FestivalModule,
    ArticleModule,
    FirebaseModule,
    EmailOTPModule,
    PaymentModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard
    },
    AdminGuard,
    JWTAuthGuard
  ],
})
export class AppModule { }
