import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { ExtraccionModule } from '../extraccion/extraccion.module';
import { SocialController } from './interfaces/social.controller';
import { SocialService } from './application/social.service';
import { PostRepository } from './infrastructure/persistence/post.repository';
import { LikeRepository } from './infrastructure/persistence/like.repository';
import { CommentRepository } from './infrastructure/persistence/comment.repository';
import { FollowRepository } from './infrastructure/persistence/follow.repository';
import { PostDocument, PostSchema } from './infrastructure/schemas/post.schema';
import { LikeDocument, LikeSchema } from './infrastructure/schemas/like.schema';
import {
  CommentDocument,
  CommentSchema,
} from './infrastructure/schemas/comment.schema';
import {
  FollowDocument,
  FollowSchema,
} from './infrastructure/schemas/follow.schema';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    ExtraccionModule,
    MongooseModule.forFeature([
      { name: PostDocument.name, schema: PostSchema },
      { name: LikeDocument.name, schema: LikeSchema },
      { name: CommentDocument.name, schema: CommentSchema },
      { name: FollowDocument.name, schema: FollowSchema },
    ]),
  ],
  controllers: [SocialController],
  providers: [
    SocialService,
    {
      provide: 'IPostRepository',
      useClass: PostRepository,
    },
    {
      provide: 'ILikeRepository',
      useClass: LikeRepository,
    },
    {
      provide: 'ICommentRepository',
      useClass: CommentRepository,
    },
    {
      provide: 'IFollowRepository',
      useClass: FollowRepository,
    },
  ],
  exports: [SocialService],
})
export class SocialModule {}
