import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class BusinessChatMessageDocument extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'BusinessDocument' })
  businessId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'AppUser' })
  senderId!: Types.ObjectId;

  @Prop({ required: true })
  message!: string;

  @Prop({ default: 0 })
  likes!: number;

  @Prop({ default: 0 })
  dislikes!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const BusinessChatMessageSchema =
  SchemaFactory.createForClass(BusinessChatMessageDocument);
