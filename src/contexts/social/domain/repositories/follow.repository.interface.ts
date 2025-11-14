import { Follow } from '../entities/follow.entity';
import { BaseRepository } from '../../../shared/interfaces/base.repository';

export interface IFollowRepository extends BaseRepository<Follow> {
  findByFollower(followerId: string): Promise<Follow[]>;
  findByFollowing(followingId: string): Promise<Follow[]>;
  findFollow(followerId: string, followingId: string): Promise<Follow | null>;
  deleteFollow(followerId: string, followingId: string): Promise<boolean>;
  countFollowers(userId: string): Promise<number>;
  countFollowing(userId: string): Promise<number>;
}

