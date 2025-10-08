import { Post } from '../entities/post.entity';
import { BaseRepository } from '../../../shared/interfaces/base.repository';

export interface IPostRepository extends BaseRepository<Post> {
  findByAutor(autor: string): Promise<Post[]>;
  incrementLikes(id: string): Promise<Post | null>;
}
