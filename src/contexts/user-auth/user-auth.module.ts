import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAuthController } from './interfaces/user-auth.controller';
import { UserAuthService } from './application/user-auth.service';
import { AppUserRepository } from './infrastructure/persistence/app-user.repository';
import {
  AppUserDocument,
  AppUserSchema,
} from './infrastructure/schemas/app-user.schema';
import { AdminUserSeeder } from './infrastructure/seeds/admin-user.seeder';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      { name: AppUserDocument.name, schema: AppUserSchema },
    ]),
  ],
  controllers: [UserAuthController],
  providers: [
    UserAuthService,
    AdminUserSeeder,
    {
      provide: 'IAppUserRepository',
      useClass: AppUserRepository,
    },
  ],
  exports: [UserAuthService],
})
export class UserAuthModule {}
