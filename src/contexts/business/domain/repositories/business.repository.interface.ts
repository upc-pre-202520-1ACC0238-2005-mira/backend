import { Business } from '../entities/business.entity';
import { BaseRepository } from '../../../shared/interfaces/base.repository';

export interface IBusinessRepository extends BaseRepository<Business> {
  findByUserId(userId: string): Promise<Business[]>;
}
