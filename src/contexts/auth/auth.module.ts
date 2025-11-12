import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './interfaces/auth.controller';
import { AuthService } from './application/auth.service';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { UserDocument, UserSchema } from './infrastructure/schemas/user.schema';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET no está definido en las variables de entorno');
        }
        return {
          secret,
          signOptions: { expiresIn: '7d' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: [AuthService, 'IUserRepository'],
})
export class AuthModule {}
