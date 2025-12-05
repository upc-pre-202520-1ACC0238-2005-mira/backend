import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'BusinessDocument' })
  businessId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'AppUser' })
  assignedToUserId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'AppUser' })
  assignedByUserId!: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  })
  status!: 'pending' | 'in_progress' | 'completed';

  createdAt!: Date;
  updatedAt!: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
