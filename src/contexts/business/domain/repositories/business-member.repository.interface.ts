import { BusinessMember } from '../entities/business-member.entity';
import { BaseRepository } from '../../../shared/interfaces/base.repository';
import { AppUser } from '../../../user-auth/domain/entities/app-user.entity';

export interface IBusinessMemberRepository
  extends BaseRepository<BusinessMember> {
  findByBusinessId(businessId: string): Promise<BusinessMember[]>;
  findByUserId(userId: string): Promise<BusinessMember[]>;
  getUsersByBusinessId(businessId: string): Promise<AppUser[]>;
  addMembers(businessId: string, userIds: string[]): Promise<BusinessMember[]>;
  removeMember(businessId: string, userId: string): Promise<boolean>;
}
