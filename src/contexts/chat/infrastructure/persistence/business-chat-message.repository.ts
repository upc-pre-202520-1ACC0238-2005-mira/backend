import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { IBusinessChatMessageRepository } from '../../domain/repositories/business-chat-message.repository.interface';
import { BusinessChatMessage } from '../../domain/entities/business-chat-message.entity';
import {
  BusinessChatMessageDocument,
  BusinessChatMessageSchema,
} from '../schemas/business-chat-message.schema';

@Injectable()
export class BusinessChatMessageRepository
  implements IBusinessChatMessageRepository
{
  constructor(
    @InjectModel(BusinessChatMessageDocument.name)
    private readonly businessChatMessageModel: Model<BusinessChatMessageDocument>,
  ) {}

  async findAll(): Promise<BusinessChatMessage[]> {
    const messages = await this.businessChatMessageModel.find().exec();
    return messages.map((msg) => this.toEntity(msg));
  }

  async findById(id: string): Promise<BusinessChatMessage | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const message = await this.businessChatMessageModel.findById(id).exec();
    return message ? this.toEntity(message) : null;
  }

  async findByBusinessId(businessId: string): Promise<BusinessChatMessage[]> {
    if (!Types.ObjectId.isValid(businessId)) {
      return [];
    }
    const messages = await this.businessChatMessageModel
      .find({ businessId: new Types.ObjectId(businessId) })
      .sort({ createdAt: 1 })
      .exec();
    return messages.map((msg) => this.toEntity(msg));
  }

  async create(
    data: Partial<BusinessChatMessage>,
  ): Promise<BusinessChatMessage> {
    const newMessage = new this.businessChatMessageModel({
      businessId: new Types.ObjectId(data.businessId),
      senderId: new Types.ObjectId(data.senderId),
      message: data.message,
      likes: data.likes ?? 0,
      dislikes: data.dislikes ?? 0,
    });
    const savedMessage = await newMessage.save();
    return this.toEntity(savedMessage);
  }

  async update(
    id: string,
    data: Partial<BusinessChatMessage>,
  ): Promise<BusinessChatMessage | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const updateData: any = {};
    if (data.message) {
      updateData.message = data.message;
    }
    if (data.likes !== undefined) {
      updateData.likes = data.likes;
    }
    if (data.dislikes !== undefined) {
      updateData.dislikes = data.dislikes;
    }

    const updatedMessage = await this.businessChatMessageModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    return updatedMessage ? this.toEntity(updatedMessage) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await this.businessChatMessageModel
      .findByIdAndDelete(id)
      .exec();
    return result !== null;
  }

  private toEntity(messageDoc: BusinessChatMessageDocument): BusinessChatMessage {
    const id =
      messageDoc._id instanceof Types.ObjectId
        ? messageDoc._id.toString()
        : String(messageDoc._id);

    const businessId =
      messageDoc.businessId instanceof Types.ObjectId
        ? messageDoc.businessId.toString()
        : String(messageDoc.businessId);

    const senderId =
      messageDoc.senderId instanceof Types.ObjectId
        ? messageDoc.senderId.toString()
        : String(messageDoc.senderId);

    const message = new BusinessChatMessage(
      businessId,
      senderId,
      messageDoc.message,
      messageDoc.likes,
      messageDoc.dislikes,
    );
    message.id = id;
    message.createdAt = messageDoc.createdAt;
    message.updatedAt = messageDoc.updatedAt;
    return message;
  }
}
