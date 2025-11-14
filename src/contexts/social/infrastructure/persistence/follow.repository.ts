import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IFollowRepository } from '../../domain/repositories/follow.repository.interface';
import { Follow } from '../../domain/entities/follow.entity';
import { FollowDocument } from '../schemas/follow.schema';

@Injectable()
export class FollowRepository implements IFollowRepository {
  constructor(
    @InjectModel(FollowDocument.name)
    private readonly followModel: Model<FollowDocument>,
  ) {}

  async findAll(): Promise<Follow[]> {
    const follows = await this.followModel.find().exec();
    return follows.map((follow) => this.toEntity(follow));
  }

  async findById(id: string): Promise<Follow | null> {
    const follow = await this.followModel.findById(id).exec();
    return follow ? this.toEntity(follow) : null;
  }

  async create(data: Partial<Follow>): Promise<Follow> {
    const newFollow = new this.followModel(data);
    const savedFollow = await newFollow.save();
    return this.toEntity(savedFollow);
  }

  async update(id: string, data: Partial<Follow>): Promise<Follow | null> {
    const updatedFollow = await this.followModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    return updatedFollow ? this.toEntity(updatedFollow) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.followModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async findByFollower(followerId: string): Promise<Follow[]> {
    const follows = await this.followModel.find({ followerId }).exec();
    return follows.map((follow) => this.toEntity(follow));
  }

  async findByFollowing(followingId: string): Promise<Follow[]> {
    const follows = await this.followModel.find({ followingId }).exec();
    return follows.map((follow) => this.toEntity(follow));
  }

  async findFollow(followerId: string, followingId: string): Promise<Follow | null> {
    const follow = await this.followModel
      .findOne({ followerId, followingId })
      .exec();
    return follow ? this.toEntity(follow) : null;
  }

  async deleteFollow(followerId: string, followingId: string): Promise<boolean> {
    const result = await this.followModel
      .deleteOne({ followerId, followingId })
      .exec();
    return result.deletedCount > 0;
  }

  async countFollowers(userId: string): Promise<number> {
    return this.followModel.countDocuments({ followingId: userId }).exec();
  }

  async countFollowing(userId: string): Promise<number> {
    return this.followModel.countDocuments({ followerId: userId }).exec();
  }

  private toEntity(followDoc: FollowDocument): Follow {
    return {
      id: (followDoc._id as any).toString(),
      followerId: followDoc.followerId,
      followingId: followDoc.followingId,
      createdAt: followDoc.createdAt,
      updatedAt: followDoc.updatedAt,
    };
  }
}

