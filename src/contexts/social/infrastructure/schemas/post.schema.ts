import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PostDocument extends Document {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  userName!: string;

  @Prop({ required: true })
  userEmail!: string;

  @Prop({ required: true })
  content!: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  extractionId?: string;

  @Prop({ default: 0 })
  likesCount!: number;

  @Prop({ default: 0 })
  commentsCount!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PostSchema = SchemaFactory.createForClass(PostDocument);
