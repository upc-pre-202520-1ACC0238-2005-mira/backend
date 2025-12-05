import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';
import {
  NotificationDocument,
  NotificationSchema,
} from '../schemas/notification.schema';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectModel(NotificationDocument.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async findAll(): Promise<Notification[]> {
    const notifications = await this.notificationModel.find().exec();
    return notifications.map((notif) => this.toEntity(notif));
  }

  async findById(id: string): Promise<Notification | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const notification = await this.notificationModel.findById(id).exec();
    return notification ? this.toEntity(notification) : null;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    if (!Types.ObjectId.isValid(userId)) {
      return [];
    }
    const notifications = await this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
    return notifications.map((notif) => this.toEntity(notif));
  }

  async markAsRead(notificationId: string): Promise<Notification | null> {
    if (!Types.ObjectId.isValid(notificationId)) {
      return null;
    }
    const notification = await this.notificationModel
      .findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true },
      )
      .exec();
    return notification ? this.toEntity(notification) : null;
  }

  async markAllAsRead(userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) {
      return;
    }
    await this.notificationModel
      .updateMany(
        { userId: new Types.ObjectId(userId), isRead: false },
        { isRead: true },
      )
      .exec();
  }

  async getUnreadCount(userId: string): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) {
      return 0;
    }
    return this.notificationModel
      .countDocuments({
        userId: new Types.ObjectId(userId),
        isRead: false,
      })
      .exec();
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    const newNotification = new this.notificationModel({
      userId: new Types.ObjectId(data.userId),
      type: data.type,
      title: data.title,
      message: data.message,
      businessId: data.businessId
        ? new Types.ObjectId(data.businessId)
        : undefined,
      senderId: data.senderId
        ? new Types.ObjectId(data.senderId)
        : undefined,
      isRead: data.isRead ?? false,
    });
    const savedNotification = await newNotification.save();
    return this.toEntity(savedNotification);
  }

  async update(
    id: string,
    data: Partial<Notification>,
  ): Promise<Notification | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const updateData: any = {};
    if (data.isRead !== undefined) {
      updateData.isRead = data.isRead;
    }
    if (data.title) {
      updateData.title = data.title;
    }
    if (data.message) {
      updateData.message = data.message;
    }

    const updatedNotification = await this.notificationModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    return updatedNotification ? this.toEntity(updatedNotification) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await this.notificationModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private toEntity(notifDoc: NotificationDocument): Notification {
    const id =
      notifDoc._id instanceof Types.ObjectId
        ? notifDoc._id.toString()
        : String(notifDoc._id);

    const userId =
      notifDoc.userId instanceof Types.ObjectId
        ? notifDoc.userId.toString()
        : String(notifDoc.userId);

    const businessId = notifDoc.businessId
      ? notifDoc.businessId instanceof Types.ObjectId
        ? notifDoc.businessId.toString()
        : String(notifDoc.businessId)
      : undefined;

    const senderId = notifDoc.senderId
      ? notifDoc.senderId instanceof Types.ObjectId
        ? notifDoc.senderId.toString()
        : String(notifDoc.senderId)
      : undefined;

    const notification = new Notification(
      userId,
      notifDoc.type as any,
      notifDoc.title,
      notifDoc.message,
      businessId,
      senderId,
    );
    notification.id = id;
    notification.isRead = notifDoc.isRead;
    notification.createdAt = notifDoc.createdAt;
    notification.updatedAt = notifDoc.updatedAt;
    return notification;
  }
}
