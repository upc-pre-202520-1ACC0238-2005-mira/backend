import { Like } from '../entities/like.entity';

export interface ILikeRepository {
  create(like: Like): Promise<Like>;
  findByPostAndUser(postId: string, userId: string): Promise<Like | null>;
  findByPostId(postId: string): Promise<Like[]>;
  delete(postId: string, userId: string): Promise<boolean>;
  countByPostId(postId: string): Promise<number>;
}

