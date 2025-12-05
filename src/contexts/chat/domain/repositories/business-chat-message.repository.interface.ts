import { BusinessChatMessage } from '../entities/business-chat-message.entity';
import { BaseRepository } from '../../../shared/interfaces/base.repository';

export interface IBusinessChatMessageRepository
  extends BaseRepository<BusinessChatMessage> {
  findByBusinessId(businessId: string): Promise<BusinessChatMessage[]>;
}
