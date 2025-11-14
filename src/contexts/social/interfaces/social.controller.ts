import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SocialService } from '../application/social.service';
import { CreatePostDto } from '../application/dto/create-post.dto';
import { CreateCommentDto } from '../application/dto/create-comment.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/user.decorator';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // ========== POSTS ==========

  @Post('posts')
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @CurrentUser('sub') userId: string,
    @CurrentUser('name') userName: string,
    @CurrentUser('email') userEmail: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.socialService.createPost(
      userId,
      userName,
      userEmail,
      createPostDto,
    );
  }

  @Get('posts/feed')
  @HttpCode(HttpStatus.OK)
  async getFeed(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    // Feed público - muestra todos los posts
    return this.socialService.getFeed(limit, offset);
  }

  @Get('posts/feed/following')
  @HttpCode(HttpStatus.OK)
  async getFollowingFeed(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @CurrentUser('sub') userId: string,
  ) {
    // Feed filtrado por usuarios seguidos
    return this.socialService.getFeed(limit, offset, userId);
  }

  @Get('posts/:postId')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param('postId') postId: string) {
    return this.socialService.getPostById(postId);
  }

  @Get('posts/user/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserPosts(@Param('userId') userId: string) {
    return this.socialService.getUserPosts(userId);
  }

  @Delete('posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('postId') postId: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.socialService.deletePost(postId, userId);
  }

  // ========== LIKES ==========

  @Post('posts/:postId/like')
  @HttpCode(HttpStatus.OK)
  async toggleLike(
    @Param('postId') postId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.socialService.toggleLike(postId, userId);
  }

  @Get('posts/:postId/likes')
  @HttpCode(HttpStatus.OK)
  async getPostLikes(@Param('postId') postId: string) {
    return this.socialService.getPostLikes(postId);
  }

  @Get('posts/:postId/liked')
  @HttpCode(HttpStatus.OK)
  async checkUserLiked(
    @Param('postId') postId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const liked = await this.socialService.checkUserLiked(postId, userId);
    return { liked };
  }

  // ========== COMMENTS ==========

  @Post('posts/:postId/comments')
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Param('postId') postId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('name') userName: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.socialService.createComment(
      postId,
      userId,
      userName,
      createCommentDto,
    );
  }

  @Get('posts/:postId/comments')
  @HttpCode(HttpStatus.OK)
  async getPostComments(@Param('postId') postId: string) {
    return this.socialService.getPostComments(postId);
  }

  @Get('comments/:commentId/replies')
  @HttpCode(HttpStatus.OK)
  async getCommentReplies(@Param('commentId') commentId: string) {
    return this.socialService.getCommentReplies(commentId);
  }

  @Delete('comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.socialService.deleteComment(commentId, userId);
  }

  // ========== SEARCH & FOLLOW ==========

  @Get('users/search')
  @HttpCode(HttpStatus.OK)
  async searchUsers(
    @Query('q') query: string,
    @Query('limit') limit?: number,
    @CurrentUser('sub') userId: string,
  ) {
    return this.socialService.searchUsers(query, userId, limit);
  }

  @Post('users/:userId/follow')
  @HttpCode(HttpStatus.OK)
  async followUser(
    @Param('userId') followingId: string,
    @CurrentUser('sub') followerId: string,
  ) {
    return this.socialService.toggleFollow(followerId, followingId);
  }

  @Get('users/:userId/following')
  @HttpCode(HttpStatus.OK)
  async checkFollowing(
    @Param('userId') followingId: string,
    @CurrentUser('sub') followerId: string,
  ) {
    const isFollowing = await this.socialService.checkFollowing(followerId, followingId);
    return { following: isFollowing };
  }

  @Get('users/following')
  @HttpCode(HttpStatus.OK)
  async getFollowingUsers(@CurrentUser('sub') userId: string) {
    return this.socialService.getFollowingUsers(userId);
  }

  @Get('users/followers')
  @HttpCode(HttpStatus.OK)
  async getFollowers(@CurrentUser('sub') userId: string) {
    return this.socialService.getFollowers(userId);
  }

  // ========== EXTRACTION DATA ==========

  @Get('posts/:postId/extraction')
  @HttpCode(HttpStatus.OK)
  async getPostExtractionData(@Param('postId') postId: string) {
    return this.socialService.getPostExtractionData(postId);
  }
}
