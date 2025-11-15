import { Post } from '../entities/post.entity';
import { BaseRepository } from '../../../shared/interfaces/base.repository';

export interface IPostRepository extends BaseRepository<Post> {
  findByUserId(userId: string): Promise<Post[]>;
  findFeed(limit?: number, offset?: number): Promise<Post[]>;
  findFeedByUserIds(userIds: string[], limit?: number, offset?: number): Promise<Post[]>;
  incrementLikesCount(postId: string): Promise<void>;
  decrementLikesCount(postId: string): Promise<void>;
  incrementCommentsCount(postId: string): Promise<void>;
}
