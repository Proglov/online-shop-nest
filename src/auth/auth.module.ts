import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { HashProvider } from './providers/password.provider';
import jwtConfig from '../configs/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JWTProvider } from './providers/jwt.provider';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalPhoneStrategy } from './strategies/local.phone.strategy';
import { CookieModule } from 'src/cookie/cookie.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    PassportModule,
    CookieModule
  ],
  controllers: [AuthController],
  providers: [AuthService, HashProvider, JWTProvider, LocalStrategy, LocalPhoneStrategy, JwtStrategy, JwtRefreshStrategy],
  exports: [HashProvider, JWTProvider]
})
export class AuthModule { }
