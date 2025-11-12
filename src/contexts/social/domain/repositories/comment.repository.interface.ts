import { Comment } from '../entities/comment.entity';

export interface ICommentRepository {
  create(comment: Comment): Promise<Comment>;
  findById(id: string): Promise<Comment | null>;
  findByPostId(postId: string): Promise<Comment[]>;
  findRepliesByCommentId(commentId: string): Promise<Comment[]>;
  incrementRepliesCount(commentId: string): Promise<void>;
  delete(id: string): Promise<boolean>;
}

