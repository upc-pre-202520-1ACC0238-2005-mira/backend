import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class LikeDocument extends Document {
  @Prop({ required: true })
  postId!: string;

  @Prop({ required: true })
  userId!: string;

  createdAt!: Date;
}

export const LikeSchema = SchemaFactory.createForClass(LikeDocument);

// Índice compuesto para evitar likes duplicados
LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

