import { AppUser } from '../entities/app-user.entity';
import { BaseRepository } from '../../../shared/interfaces/base.repository';
import { CreateAppUserData } from '../types/create-app-user-data.types';

export interface IAppUserRepository extends BaseRepository<AppUser> {
  findByEmail(email: string): Promise<AppUser | null>;
  createUser(data: CreateAppUserData): Promise<AppUser>;
}
