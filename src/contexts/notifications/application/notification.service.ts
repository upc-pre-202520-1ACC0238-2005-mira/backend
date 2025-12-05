import {
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import type { INotificationRepository } from '../domain/repositories/notification.repository.interface';
import type { IBusinessMemberRepository } from '../../business/domain/repositories/business-member.repository.interface';
import { Notification, NotificationType } from '../domain/entities/notification.entity';

export interface NotificationResponse {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  businessId?: string;
  senderId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class NotificationService {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
    @Inject('IBusinessMemberRepository')
    private readonly businessMemberRepository: IBusinessMemberRepository,
  ) {}

  async getUserNotifications(userId: string): Promise<NotificationResponse[]> {
    const notifications = await this.notificationRepository.findByUserId(userId);
    return notifications.map((notif) => this.toResponse(notif));
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.getUnreadCount(userId);
  }

  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<NotificationResponse> {
    const notification = await this.notificationRepository.findById(
      notificationId,
    );
    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notificación no encontrada');
    }

    const updated = await this.notificationRepository.markAsRead(notificationId);
    if (!updated) {
      throw new NotFoundException('Error al marcar como leída');
    }

    return this.toResponse(updated);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  async createBusinessMessageNotification(
    businessId: string,
    senderId: string,
    senderName: string,
    businessName: string,
    message: string,
  ): Promise<void> {
    // Obtener todos los miembros del negocio
    const members = await this.businessMemberRepository.findByBusinessId(
      businessId,
    );

    // Crear notificación para cada miembro excepto el remitente
    const notifications = members
      .filter((member) => member.userId !== senderId)
      .map(
        (member) =>
          new Notification(
            member.userId,
            'business_message',
            `Nuevo mensaje en ${businessName}`,
            `${senderName}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
            businessId,
            senderId,
          ),
      );

    for (const notif of notifications) {
      await this.notificationRepository.create(notif);
    }
  }

  async createUserAddedToBusinessNotification(
    businessId: string,
    businessName: string,
    addedUserId: string,
    addedUserName: string,
    adminName: string,
  ): Promise<void> {
    // Obtener todos los miembros del negocio
    const members = await this.businessMemberRepository.findByBusinessId(
      businessId,
    );

    // Crear notificación para todos los miembros del negocio
    const notifications = members.map(
      (member) =>
        new Notification(
          member.userId,
          'user_added_to_business',
          `Nuevo miembro en ${businessName}`,
          `${adminName} agregó a ${addedUserName} al negocio`,
          businessId,
        ),
    );

    // También notificar al usuario agregado
    notifications.push(
      new Notification(
        addedUserId,
        'user_added_to_business',
        `Te agregaron a ${businessName}`,
        `${adminName} te agregó al negocio ${businessName}`,
        businessId,
      ),
    );

    for (const notif of notifications) {
      await this.notificationRepository.create(notif);
    }
  }

  async createDirectMessageNotification(
    receiverId: string,
    senderId: string,
    senderName: string,
    message: string,
  ): Promise<void> {
    const notification = new Notification(
      receiverId,
      'direct_message',
      `Nuevo mensaje de ${senderName}`,
      message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      undefined,
      senderId,
    );

    await this.notificationRepository.create(notification);
  }

  private toResponse(notification: Notification): NotificationResponse {
    return {
      id: notification.id!,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      businessId: notification.businessId,
      senderId: notification.senderId,
      isRead: notification.isRead,
      createdAt: notification.createdAt!,
      updatedAt: notification.updatedAt!,
    };
  }
}
