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

  @Prop({ required: true })
  usuarioId!: string;

  @Prop({ min: 1, max: 5, default: 3 })
  calificacion?: number;

  @Prop()
  gramosCafe?: number;

  @Prop()
  mililitrosAgua?: number;

  @Prop()
  temperaturaAgua?: number;

  @Prop()
  tiempoExtraccion?: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const RecetaSchema = SchemaFactory.createForClass(RecetaDocument);
