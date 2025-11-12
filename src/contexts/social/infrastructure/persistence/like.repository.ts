import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ILikeRepository } from '../../domain/repositories/like.repository.interface';
import { Like } from '../../domain/entities/like.entity';
import { LikeDocument } from '../schemas/like.schema';

@Injectable()
export class LikeRepository implements ILikeRepository {
  constructor(
    @InjectModel(LikeDocument.name)
    private readonly likeModel: Model<LikeDocument>,
  ) {}

  async create(like: Like): Promise<Like> {
    const newLike = new this.likeModel(like);
    const savedLike = await newLike.save();
    return this.toEntity(savedLike);
  }

  async findByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<Like | null> {
    const like = await this.likeModel.findOne({ postId, userId }).exec();
    return like ? this.toEntity(like) : null;
  }

  async findByPostId(postId: string): Promise<Like[]> {
    const likes = await this.likeModel.find({ postId }).exec();
    return likes.map((like) => this.toEntity(like));
  }

  async delete(postId: string, userId: string): Promise<boolean> {
    const result = await this.likeModel.deleteOne({ postId, userId }).exec();
    return result.deletedCount > 0;
  }

  async countByPostId(postId: string): Promise<number> {
    return this.likeModel.countDocuments({ postId }).exec();
  }

  private toEntity(likeDoc: LikeDocument): Like {
    return {
      id: (likeDoc._id as any).toString(),
      postId: likeDoc.postId,
      userId: likeDoc.userId,
      createdAt: likeDoc.createdAt,
    };
  }
}

