import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './interfaces/notification.controller';
import { NotificationService } from './application/notification.service';
import { NotificationRepository } from './infrastructure/persistence/notification.repository';
import {
  NotificationDocument,
  NotificationSchema,
} from './infrastructure/schemas/notification.schema';
import { SharedModule } from '../shared/shared.module';
import { BusinessModule } from '../business/business.module';
import { UserAuthModule } from '../user-auth/user-auth.module';

@Module({
  imports: [
    SharedModule,
    forwardRef(() => BusinessModule),
    UserAuthModule,
    MongooseModule.forFeature([
      { name: NotificationDocument.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    {
      provide: 'INotificationRepository',
      useClass: NotificationRepository,
    },
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}
