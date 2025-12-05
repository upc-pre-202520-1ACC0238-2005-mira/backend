import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class NotificationDocument extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'AppUser' })
  userId!: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['business_message', 'user_added_to_business', 'direct_message'],
  })
  type!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ type: Types.ObjectId, ref: 'BusinessDocument' })
  businessId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AppUser' })
  senderId?: Types.ObjectId;

  @Prop({ default: false })
  isRead!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const NotificationSchema =
  SchemaFactory.createForClass(NotificationDocument);
