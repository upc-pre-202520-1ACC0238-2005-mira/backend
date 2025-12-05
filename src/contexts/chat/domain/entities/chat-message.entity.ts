export class ChatMessage {
  id?: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    senderId: string,
    receiverId: string,
    message: string,
  ) {
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.message = message;
  }
}
