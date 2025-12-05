import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { IChatMessageRepository } from '../../domain/repositories/chat-message.repository.interface';
import { ChatMessage } from '../../domain/entities/chat-message.entity';
import {
  ChatMessageDocument,
  ChatMessageSchema,
} from '../schemas/chat-message.schema';

@Injectable()
export class ChatMessageRepository implements IChatMessageRepository {
  constructor(
    @InjectModel(ChatMessageDocument.name)
    private readonly chatMessageModel: Model<ChatMessageDocument>,
  ) {}

  async findAll(): Promise<ChatMessage[]> {
    const messages = await this.chatMessageModel.find().exec();
    return messages.map((msg) => this.toEntity(msg));
  }

  async findById(id: string): Promise<ChatMessage | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const message = await this.chatMessageModel.findById(id).exec();
    return message ? this.toEntity(message) : null;
  }

  async findByConversation(
    userId1: string,
    userId2: string,
  ): Promise<ChatMessage[]> {
    if (!Types.ObjectId.isValid(userId1) || !Types.ObjectId.isValid(userId2)) {
      return [];
    }

    const messages = await this.chatMessageModel
      .find({
        $or: [
          {
            senderId: new Types.ObjectId(userId1),
            receiverId: new Types.ObjectId(userId2),
          },
          {
            senderId: new Types.ObjectId(userId2),
            receiverId: new Types.ObjectId(userId1),
          },
        ],
      })
      .sort({ createdAt: 1 })
      .exec();

    return messages.map((msg) => this.toEntity(msg));
  }

  async findByUserId(userId: string): Promise<ChatMessage[]> {
    if (!Types.ObjectId.isValid(userId)) {
      return [];
    }

    const messages = await this.chatMessageModel
      .find({
        $or: [
          { senderId: new Types.ObjectId(userId) },
          { receiverId: new Types.ObjectId(userId) },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();

    return messages.map((msg) => this.toEntity(msg));
  }

  async create(data: Partial<ChatMessage>): Promise<ChatMessage> {
    const newMessage = new this.chatMessageModel({
      senderId: new Types.ObjectId(data.senderId),
      receiverId: new Types.ObjectId(data.receiverId),
      message: data.message,
    });
    const savedMessage = await newMessage.save();
    return this.toEntity(savedMessage);
  }

  async update(
    id: string,
    data: Partial<ChatMessage>,
  ): Promise<ChatMessage | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const updateData: any = {};
    if (data.message) {
      updateData.message = data.message;
    }

    const updatedMessage = await this.chatMessageModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    return updatedMessage ? this.toEntity(updatedMessage) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await this.chatMessageModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private toEntity(messageDoc: ChatMessageDocument): ChatMessage {
    const id =
      messageDoc._id instanceof Types.ObjectId
        ? messageDoc._id.toString()
        : String(messageDoc._id);

    const senderId =
      messageDoc.senderId instanceof Types.ObjectId
        ? messageDoc.senderId.toString()
        : String(messageDoc.senderId);

    const receiverId =
      messageDoc.receiverId instanceof Types.ObjectId
        ? messageDoc.receiverId.toString()
        : String(messageDoc.receiverId);

    const message = new ChatMessage(senderId, receiverId, messageDoc.message);
    message.id = id;
    message.createdAt = messageDoc.createdAt;
    message.updatedAt = messageDoc.updatedAt;
    return message;
  }
}
