import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from '../application/chat.service';
import { CreateChatMessageDto } from '../application/dto/create-chat-message.dto';
import { CreateBusinessChatMessageDto } from '../application/dto/create-business-chat-message.dto';
import { ReactMessageDto } from '../application/dto/react-message.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversation/:userId')
  async getConversation(
    @CurrentUser('sub') currentUserId: string,
    @Param('userId') otherUserId: string,
  ) {
    return this.chatService.getConversation(currentUserId, otherUserId);
  }

  @Post('message/:userId')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @CurrentUser('sub') senderId: string,
    @Param('userId') receiverId: string,
    @Body() createChatMessageDto: CreateChatMessageDto,
  ) {
    return this.chatService.sendMessage(
      senderId,
      receiverId,
      createChatMessageDto,
    );
  }

  @Get('business/:businessId')
  async getBusinessChatMessages(
    @CurrentUser('sub') userId: string,
    @Param('businessId') businessId: string,
  ) {
    return this.chatService.getBusinessChatMessages(businessId, userId);
  }

  @Post('business/:businessId')
  @HttpCode(HttpStatus.CREATED)
  async sendBusinessChatMessage(
    @CurrentUser('sub') senderId: string,
    @Param('businessId') businessId: string,
    @Body() createBusinessChatMessageDto: CreateBusinessChatMessageDto,
  ) {
    return this.chatService.sendBusinessChatMessage(
      businessId,
      senderId,
      createBusinessChatMessageDto,
    );
  }

  @Patch('business/message/:messageId/react')
  @HttpCode(HttpStatus.OK)
  async reactToBusinessMessage(
    @CurrentUser('sub') userId: string,
    @Param('messageId') messageId: string,
    @Body() reactMessageDto: ReactMessageDto,
  ) {
    return this.chatService.reactToBusinessMessage(
      messageId,
      userId,
      reactMessageDto,
    );
  }
}
