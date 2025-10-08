import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PostDocument extends Document {
  @Prop({ required: true })
  autor!: string;

  @Prop({ required: true })
  contenido!: string;

  @Prop({ required: true, default: () => new Date() })
  fecha!: Date;

  @Prop({ default: 0 })
  likes!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PostSchema = SchemaFactory.createForClass(PostDocument);
