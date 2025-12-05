export class BusinessChatMessage {
  id?: string;
  businessId: string;
  senderId: string;
  message: string;
  likes: number;
  dislikes: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    businessId: string,
    senderId: string,
    message: string,
    likes: number = 0,
    dislikes: number = 0,
  ) {
    this.businessId = businessId;
    this.senderId = senderId;
    this.message = message;
    this.likes = likes;
    this.dislikes = dislikes;
  }
}
