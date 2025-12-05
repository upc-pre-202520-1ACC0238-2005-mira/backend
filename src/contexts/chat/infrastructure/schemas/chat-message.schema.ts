import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ChatMessageDocument extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'AppUser' })
  senderId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'AppUser' })
  receiverId!: Types.ObjectId;

  @Prop({ required: true })
  message!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ChatMessageSchema =
  SchemaFactory.createForClass(ChatMessageDocument);
