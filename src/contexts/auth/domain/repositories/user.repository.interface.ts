import { User } from '../entities/user.entity';
import { BaseRepository } from '../../../shared/interfaces/base.repository';

export interface IUserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  searchUsers(query: string, limit?: number): Promise<User[]>;
}
