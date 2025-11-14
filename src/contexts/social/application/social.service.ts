import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import type { IPostRepository } from '../domain/repositories/post.repository.interface';
import type { ILikeRepository } from '../domain/repositories/like.repository.interface';
import type { ICommentRepository } from '../domain/repositories/comment.repository.interface';
import type { IFollowRepository } from '../domain/repositories/follow.repository.interface';
import type { IUserRepository } from '../../auth/domain/repositories/user.repository.interface';
import { ExtraccionService } from '../../extraccion/application/extraccion.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from '../domain/entities/post.entity';
import { Like } from '../domain/entities/like.entity';
import { Comment } from '../domain/entities/comment.entity';
import { Follow } from '../domain/entities/follow.entity';

@Injectable()
export class SocialService {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
    @Inject('ILikeRepository')
    private readonly likeRepository: ILikeRepository,
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
    @Inject('IFollowRepository')
    private readonly followRepository: IFollowRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly extraccionService: ExtraccionService,
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

  async getFeed(limit?: number, offset?: number, userId?: string): Promise<Post[]> {
    // Si hay userId, filtrar por usuarios seguidos
    if (userId) {
      const follows = await this.followRepository.findByFollower(userId);
      const followingIds = follows.map((f) => f.followingId);
      
      // Si no sigue a nadie, retornar array vacío
      if (followingIds.length === 0) {
        return [];
      }
      
      // Incluir también los posts del propio usuario
      followingIds.push(userId);
      
      return this.postRepository.findFeedByUserIds(followingIds, limit, offset);
    }
    
    // Si no hay userId, retornar todos los posts
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

  // ========== FOLLOW ==========

  async searchUsers(query: string, currentUserId: string, limit?: number): Promise<any[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const users = await this.userRepository.searchUsers(query, limit || 20);
    
    // Obtener información de seguimiento para cada usuario
    const usersWithFollowStatus = await Promise.all(
      users
        .filter((user) => user.id !== currentUserId) // Excluir al usuario actual
        .map(async (user) => {
          const isFollowing = await this.followRepository.findFollow(
            currentUserId,
            user.id!,
          );
          const followersCount = await this.followRepository.countFollowers(user.id!);
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isFollowing: !!isFollowing,
            followersCount,
          };
        }),
    );

    return usersWithFollowStatus;
  }

  async followUser(followerId: string, followingId: string): Promise<{ following: boolean }> {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    // Verificar que el usuario a seguir existe
    const userToFollow = await this.userRepository.findById(followingId);
    if (!userToFollow) {
      throw new NotFoundException('User to follow not found');
    }

    // Verificar si ya lo sigue
    const existingFollow = await this.followRepository.findFollow(followerId, followingId);
    if (existingFollow) {
      throw new ConflictException('You are already following this user');
    }

    const follow = new Follow(followerId, followingId);
    await this.followRepository.create(follow);

    return { following: true };
  }

  async unfollowUser(followerId: string, followingId: string): Promise<{ following: boolean }> {
    const deleted = await this.followRepository.deleteFollow(followerId, followingId);
    if (!deleted) {
      throw new NotFoundException('Follow relationship not found');
    }

    return { following: false };
  }

  async toggleFollow(followerId: string, followingId: string): Promise<{ following: boolean }> {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const existingFollow = await this.followRepository.findFollow(followerId, followingId);
    
    if (existingFollow) {
      await this.followRepository.deleteFollow(followerId, followingId);
      return { following: false };
    } else {
      // Verificar que el usuario a seguir existe
      const userToFollow = await this.userRepository.findById(followingId);
      if (!userToFollow) {
        throw new NotFoundException('User to follow not found');
      }

      const follow = new Follow(followerId, followingId);
      await this.followRepository.create(follow);
      return { following: true };
    }
  }

  async checkFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepository.findFollow(followerId, followingId);
    return !!follow;
  }

  async getFollowingUsers(userId: string): Promise<any[]> {
    const follows = await this.followRepository.findByFollower(userId);
    const followingIds = follows.map((f) => f.followingId);
    
    const users = await Promise.all(
      followingIds.map(async (id) => {
        const user = await this.userRepository.findById(id);
        if (!user) return null;
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }),
    );

    return users.filter((u) => u !== null) as any[];
  }

  async getFollowers(userId: string): Promise<any[]> {
    const follows = await this.followRepository.findByFollowing(userId);
    const followerIds = follows.map((f) => f.followerId);
    
    const users = await Promise.all(
      followerIds.map(async (id) => {
        const user = await this.userRepository.findById(id);
        if (!user) return null;
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }),
    );

    return users.filter((u) => u !== null) as any[];
  }

  // ========== EXTRACTION DATA ==========

  async getPostExtractionData(postId: string): Promise<any> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (!post.extractionId) {
      throw new NotFoundException('Post does not have an associated extraction');
    }

    // El extractionId es el recetaId, obtener la receta completa
    const receta = await this.extraccionService.findById(post.extractionId);
    if (!receta) {
      throw new NotFoundException('Recipe not found');
    }

    return {
      recetaId: receta.id,
      nombre: receta.nombre,
      metodo: receta.metodo,
      ratio: receta.ratio,
      gramosCafe: receta.gramosCafe,
      mililitrosAgua: receta.mililitrosAgua,
      temperaturaAgua: receta.temperaturaAgua,
      tiempoExtraccion: receta.tiempoExtraccion,
      configuracion: receta.configuracion,
      notas: receta.notas,
    };
  }
}
