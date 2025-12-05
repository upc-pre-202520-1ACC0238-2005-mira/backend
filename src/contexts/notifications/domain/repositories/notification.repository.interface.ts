import { Notification } from '../entities/notification.entity';
import { BaseRepository } from '../../../shared/interfaces/base.repository';

export interface INotificationRepository
  extends BaseRepository<Notification> {
  findByUserId(userId: string): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<Notification | null>;
  markAllAsRead(userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}
