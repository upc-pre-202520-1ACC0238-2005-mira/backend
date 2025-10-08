import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RecetaDocument extends Document {
  @Prop({ required: true })
  nombre!: string;

  @Prop({ required: true })
  metodo!: string;

  @Prop({ required: true })
  ratio!: string;

  @Prop()
  notas?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const RecetaSchema = SchemaFactory.createForClass(RecetaDocument);
