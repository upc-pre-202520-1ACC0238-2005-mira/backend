import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';
import { Post } from '../../domain/entities/post.entity';
import { PostDocument } from '../schemas/post.schema';

@Injectable()
export class PostRepository implements IPostRepository {
  constructor(
    @InjectModel(PostDocument.name)
    private readonly postModel: Model<PostDocument>,
  ) {}

  async findAll(): Promise<Post[]> {
    const posts = await this.postModel.find().sort({ createdAt: -1 }).exec();
    return posts.map((post) => this.toEntity(post));
  }

  async findById(id: string): Promise<Post | null> {
    const post = await this.postModel.findById(id).exec();
    return post ? this.toEntity(post) : null;
  }

  async findByUserId(userId: string): Promise<Post[]> {
    const posts = await this.postModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return posts.map((post) => this.toEntity(post));
  }

  async findFeed(limit: number = 20, offset: number = 0): Promise<Post[]> {
    const posts = await this.postModel
      .find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
    return posts.map((post) => this.toEntity(post));
  }

  async findFeedByUserIds(userIds: string[], limit: number = 20, offset: number = 0): Promise<Post[]> {
    const posts = await this.postModel
      .find({ userId: { $in: userIds } })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
    return posts.map((post) => this.toEntity(post));
  }

  async create(data: Partial<Post>): Promise<Post> {
    const newPost = new this.postModel(data);
    const savedPost = await newPost.save();
    return this.toEntity(savedPost);
  }

  async update(id: string, data: Partial<Post>): Promise<Post | null> {
    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    return updatedPost ? this.toEntity(updatedPost) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.postModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async incrementLikesCount(postId: string): Promise<void> {
    await this.postModel
      .findByIdAndUpdate(postId, { $inc: { likesCount: 1 } })
      .exec();
  }

  async decrementLikesCount(postId: string): Promise<void> {
    await this.postModel
      .findByIdAndUpdate(postId, { $inc: { likesCount: -1 } })
      .exec();
  }

  async incrementCommentsCount(postId: string): Promise<void> {
    await this.postModel
      .findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } })
      .exec();
  }

  private toEntity(postDoc: PostDocument): Post {
    return {
      id: (postDoc._id as any).toString(),
      userId: postDoc.userId,
      userName: postDoc.userName,
      userEmail: postDoc.userEmail,
      content: postDoc.content,
      imageUrl: postDoc.imageUrl,
      extractionId: postDoc.extractionId,
      likesCount: postDoc.likesCount,
      commentsCount: postDoc.commentsCount,
      createdAt: postDoc.createdAt,
      updatedAt: postDoc.updatedAt,
    };
  }
}
