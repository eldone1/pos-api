import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        const jwtExpirationStr = configService.get<string>('JWT_EXPIRATION') || '86400'; // 24 hours in seconds

        if (!jwtSecret) {
          throw new Error('JWT_SECRET environment variable is required');
        }

        const expiresIn = parseInt(jwtExpirationStr, 10);
        if (isNaN(expiresIn)) {
          throw new Error('JWT_EXPIRATION must be a valid number (seconds)');
        }

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn, // number of seconds
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}