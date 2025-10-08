import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ProductoDocument extends Document {
  @Prop({ required: true })
  nombre!: string;

  @Prop({ required: true })
  precio!: number;

  @Prop({ required: true, default: 0 })
  stock!: number;

  @Prop()
  descripcion?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ProductoSchema = SchemaFactory.createForClass(ProductoDocument);
