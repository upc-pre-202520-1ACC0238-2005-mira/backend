import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './interfaces/chat.controller';
import { ChatService } from './application/chat.service';
import { ChatMessageRepository } from './infrastructure/persistence/chat-message.repository';
import { BusinessChatMessageRepository } from './infrastructure/persistence/business-chat-message.repository';
import {
  ChatMessageDocument,
  ChatMessageSchema,
} from './infrastructure/schemas/chat-message.schema';
import {
  BusinessChatMessageDocument,
  BusinessChatMessageSchema,
} from './infrastructure/schemas/business-chat-message.schema';
import { SharedModule } from '../shared/shared.module';
import { UserAuthModule } from '../user-auth/user-auth.module';
import { BusinessModule } from '../business/business.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    SharedModule,
    UserAuthModule,
    forwardRef(() => BusinessModule),
    forwardRef(() => NotificationsModule),
    MongooseModule.forFeature([
      { name: ChatMessageDocument.name, schema: ChatMessageSchema },
      {
        name: BusinessChatMessageDocument.name,
        schema: BusinessChatMessageSchema,
      },
    ]),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    {
      provide: 'IChatMessageRepository',
      useClass: ChatMessageRepository,
    },
    {
      provide: 'IBusinessChatMessageRepository',
      useClass: BusinessChatMessageRepository,
    },
  ],
  exports: [ChatService],
})
export class ChatModule {}
