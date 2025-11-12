import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../shared/shared.module';
import { SocialController } from './interfaces/social.controller';
import { SocialService } from './application/social.service';
import { PostRepository } from './infrastructure/persistence/post.repository';
import { LikeRepository } from './infrastructure/persistence/like.repository';
import { CommentRepository } from './infrastructure/persistence/comment.repository';
import { PostDocument, PostSchema } from './infrastructure/schemas/post.schema';
import { LikeDocument, LikeSchema } from './infrastructure/schemas/like.schema';
import {
  CommentDocument,
  CommentSchema,
} from './infrastructure/schemas/comment.schema';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      { name: PostDocument.name, schema: PostSchema },
      { name: LikeDocument.name, schema: LikeSchema },
      { name: CommentDocument.name, schema: CommentSchema },
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
  ],
  exports: [SocialService],
})
export class SocialModule {}
