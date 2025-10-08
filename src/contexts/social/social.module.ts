import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialController } from './interfaces/social.controller';
import { SocialService } from './application/social.service';
import { PostRepository } from './infrastructure/persistence/post.repository';
import { PostDocument, PostSchema } from './infrastructure/schemas/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostDocument.name, schema: PostSchema },
    ]),
  ],
  controllers: [SocialController],
  providers: [
    SocialService,
    {
      provide: 'IPostRepository',
      useClass: PostRepository,
    },
  ],
  exports: [SocialService],
})
export class SocialModule {}
