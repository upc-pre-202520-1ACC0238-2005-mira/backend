export type NotificationType =
  | 'business_message'
  | 'user_added_to_business'
  | 'direct_message';

export class Notification {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  businessId?: string;
  senderId?: string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    businessId?: string,
    senderId?: string,
  ) {
    this.userId = userId;
    this.type = type;
    this.title = title;
    this.message = message;
    this.businessId = businessId;
    this.senderId = senderId;
    this.isRead = false;
  }
}
