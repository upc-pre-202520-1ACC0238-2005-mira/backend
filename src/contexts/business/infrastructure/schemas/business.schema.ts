import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class BusinessDocument extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  address!: string;

  @Prop()
  description?: string;

  @Prop()
  logo?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'AppUser' })
  userId!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const BusinessSchema = SchemaFactory.createForClass(BusinessDocument);
