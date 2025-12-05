import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { IBusinessMemberRepository } from '../../domain/repositories/business-member.repository.interface';
import type { IAppUserRepository } from '../../../user-auth/domain/repositories/app-user.repository.interface';
import { BusinessMember } from '../../domain/entities/business-member.entity';
import { AppUser } from '../../../user-auth/domain/entities/app-user.entity';
import {
  BusinessMemberDocument,
  BusinessMemberSchema,
} from '../schemas/business-member.schema';

@Injectable()
export class BusinessMemberRepository implements IBusinessMemberRepository {
  constructor(
    @InjectModel(BusinessMemberDocument.name)
    private readonly businessMemberModel: Model<BusinessMemberDocument>,
    @Inject('IAppUserRepository')
    private readonly appUserRepository: IAppUserRepository,
  ) {}

  async findAll(): Promise<BusinessMember[]> {
    const members = await this.businessMemberModel.find().exec();
    return members.map((member) => this.toEntity(member));
  }

  async findById(id: string): Promise<BusinessMember | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const member = await this.businessMemberModel.findById(id).exec();
    return member ? this.toEntity(member) : null;
  }

  async findByBusinessId(businessId: string): Promise<BusinessMember[]> {
    if (!Types.ObjectId.isValid(businessId)) {
      return [];
    }
    const members = await this.businessMemberModel
      .find({ businessId: new Types.ObjectId(businessId) })
      .exec();
    return members.map((member) => this.toEntity(member));
  }

  async findByUserId(userId: string): Promise<BusinessMember[]> {
    if (!Types.ObjectId.isValid(userId)) {
      return [];
    }
    const members = await this.businessMemberModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
    return members.map((member) => this.toEntity(member));
  }

  async addMembers(
    businessId: string,
    userIds: string[],
  ): Promise<BusinessMember[]> {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid businessId');
    }

    const existingMembers = await this.businessMemberModel
      .find({
        businessId: new Types.ObjectId(businessId),
        userId: { $in: userIds.map((id) => new Types.ObjectId(id)) },
      })
      .exec();

    const existingUserIds = new Set(
      existingMembers.map((m) => m.userId.toString()),
    );

    const newMembers = userIds
      .filter((userId) => !existingUserIds.has(userId))
      .map(
        (userId) =>
          new this.businessMemberModel({
            businessId: new Types.ObjectId(businessId),
            userId: new Types.ObjectId(userId),
          }),
      );

    if (newMembers.length === 0) {
      return existingMembers.map((m) => this.toEntity(m));
    }

    const savedMembers = await this.businessMemberModel.insertMany(newMembers);
    const allMembers = [...existingMembers, ...savedMembers];
    return allMembers.map((member) => this.toEntity(member));
  }

  async getUsersByBusinessId(businessId: string): Promise<AppUser[]> {
    if (!Types.ObjectId.isValid(businessId)) {
      return [];
    }

    const members = await this.businessMemberModel
      .find({ businessId: new Types.ObjectId(businessId) })
      .exec();

    const userIds = members.map((m) => m.userId.toString());
    const users: AppUser[] = [];

    for (const userId of userIds) {
      const user = await this.appUserRepository.findById(userId);
      if (user) {
        users.push(user);
      }
    }

    return users;
  }

  async removeMember(businessId: string, userId: string): Promise<boolean> {
    if (
      !Types.ObjectId.isValid(businessId) ||
      !Types.ObjectId.isValid(userId)
    ) {
      return false;
    }

    const result = await this.businessMemberModel
      .deleteOne({
        businessId: new Types.ObjectId(businessId),
        userId: new Types.ObjectId(userId),
      })
      .exec();

    return result.deletedCount > 0;
  }

  async create(data: Partial<BusinessMember>): Promise<BusinessMember> {
    const newMember = new this.businessMemberModel({
      businessId: new Types.ObjectId(data.businessId),
      userId: new Types.ObjectId(data.userId),
    });
    const savedMember = await newMember.save();
    return this.toEntity(savedMember);
  }

  async update(
    id: string,
    data: Partial<BusinessMember>,
  ): Promise<BusinessMember | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const updateData: any = {};
    if (data.businessId) {
      updateData.businessId = new Types.ObjectId(data.businessId);
    }
    if (data.userId) {
      updateData.userId = new Types.ObjectId(data.userId);
    }

    const updatedMember = await this.businessMemberModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    return updatedMember ? this.toEntity(updatedMember) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await this.businessMemberModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private toEntity(memberDoc: BusinessMemberDocument): BusinessMember {
    const id =
      memberDoc._id instanceof Types.ObjectId
        ? memberDoc._id.toString()
        : String(memberDoc._id);

    const businessId =
      memberDoc.businessId instanceof Types.ObjectId
        ? memberDoc.businessId.toString()
        : String(memberDoc.businessId);

    const userId =
      memberDoc.userId instanceof Types.ObjectId
        ? memberDoc.userId.toString()
        : String(memberDoc.userId);

    const member = new BusinessMember(businessId, userId);
    member.id = id;
    member.createdAt = memberDoc.createdAt;
    member.updatedAt = memberDoc.updatedAt;
    return member;
  }
}
