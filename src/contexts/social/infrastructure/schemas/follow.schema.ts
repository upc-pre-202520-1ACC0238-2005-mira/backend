import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class FollowDocument extends Document {
  @Prop({ required: true, index: true })
  followerId!: string; // Usuario que sigue

  @Prop({ required: true, index: true })
  followingId!: string; // Usuario/cafetería seguido

  createdAt!: Date;
  updatedAt!: Date;
}

export const FollowSchema = SchemaFactory.createForClass(FollowDocument);

// Índice compuesto para evitar duplicados
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

