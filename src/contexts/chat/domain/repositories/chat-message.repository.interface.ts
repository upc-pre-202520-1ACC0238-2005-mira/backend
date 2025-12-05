import { ChatMessage } from '../entities/chat-message.entity';
import { BaseRepository } from '../../../shared/interfaces/base.repository';

export interface IChatMessageRepository
  extends BaseRepository<ChatMessage> {
  findByConversation(
    userId1: string,
    userId2: string,
  ): Promise<ChatMessage[]>;
  findByUserId(userId: string): Promise<ChatMessage[]>;
}
