import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import type { IPostRepository } from '../domain/repositories/post.repository.interface';
import type { ILikeRepository } from '../domain/repositories/like.repository.interface';
import type { ICommentRepository } from '../domain/repositories/comment.repository.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from '../domain/entities/post.entity';
import { Like } from '../domain/entities/like.entity';
import { Comment } from '../domain/entities/comment.entity';

@Injectable()
export class SocialService {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
    @Inject('ILikeRepository')
    private readonly likeRepository: ILikeRepository,
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
  ) {}

  // ========== POSTS ==========

  async createPost(
    userId: string,
    userName: string,
    userEmail: string,
    createPostDto: CreatePostDto,
  ): Promise<Post> {
    const post = new Post(
      userId,
      userName,
      userEmail,
      createPostDto.content,
      createPostDto.imageUrl,
      createPostDto.extractionId,
    );

    return this.postRepository.create(post);
  }

  async getFeed(limit?: number, offset?: number): Promise<Post[]> {
    return this.postRepository.findFeed(limit, offset);
  }

  async getPostById(postId: string): Promise<Post> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return this.postRepository.findByUserId(userId);
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ConflictException('You can only delete your own posts');
    }

    await this.postRepository.delete(postId);
  }

  // ========== LIKES ==========

  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean }> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.likeRepository.findByPostAndUser(
      postId,
      userId,
    );

    if (existingLike) {
      // Unlike
      await this.likeRepository.delete(postId, userId);
      await this.postRepository.decrementLikesCount(postId);
      return { liked: false };
    } else {
      // Like
      const like = new Like(postId, userId);
      await this.likeRepository.create(like);
      await this.postRepository.incrementLikesCount(postId);
      return { liked: true };
    }
  }

  async getPostLikes(postId: string): Promise<Like[]> {
    return this.likeRepository.findByPostId(postId);
  }

  async checkUserLiked(postId: string, userId: string): Promise<boolean> {
    const like = await this.likeRepository.findByPostAndUser(postId, userId);
    return !!like;
  }

  // ========== COMMENTS ==========

  async createComment(
    postId: string,
    userId: string,
    userName: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Si es una respuesta, verificar que el comentario padre exista
    if (createCommentDto.parentCommentId) {
      const parentComment = await this.commentRepository.findById(
        createCommentDto.parentCommentId,
      );
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
      // Incrementar contador de respuestas del comentario padre
      await this.commentRepository.incrementRepliesCount(
        createCommentDto.parentCommentId,
      );
    }

    const comment = new Comment(
      postId,
      userId,
      userName,
      createCommentDto.content,
      createCommentDto.parentCommentId,
    );

    const createdComment = await this.commentRepository.create(comment);

    // Incrementar contador de comentarios del post
    await this.postRepository.incrementCommentsCount(postId);

    return createdComment;
  }

  async getPostComments(postId: string): Promise<Comment[]> {
    return this.commentRepository.findByPostId(postId);
  }

  async getCommentReplies(commentId: string): Promise<Comment[]> {
    return this.commentRepository.findRepliesByCommentId(commentId);
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ConflictException('You can only delete your own comments');
    }

    await this.commentRepository.delete(commentId);
  }
}
