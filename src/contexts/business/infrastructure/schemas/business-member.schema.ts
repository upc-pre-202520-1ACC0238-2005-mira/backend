import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class BusinessMemberDocument extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'BusinessDocument' })
  businessId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'AppUser' })
  userId!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const BusinessMemberSchema =
  SchemaFactory.createForClass(BusinessMemberDocument);
