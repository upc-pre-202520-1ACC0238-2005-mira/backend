import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CommentDocument extends Document {
  @Prop({ required: true })
  postId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  userName!: string;

  @Prop({ required: true })
  content!: string;

  @Prop()
  parentCommentId?: string;

  @Prop({ default: 0 })
  repliesCount!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CommentSchema = SchemaFactory.createForClass(CommentDocument);

// Índices para consultas eficientes
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ parentCommentId: 1, createdAt: 1 });

