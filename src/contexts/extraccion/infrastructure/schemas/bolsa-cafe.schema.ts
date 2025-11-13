import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BolsaCafeDocument extends Document {
  @Prop({ required: true })
  usuarioId!: string;

  @Prop({ required: true })
  nombre!: string;

  @Prop()
  origen?: string;

  @Prop()
  tostador?: string;

  @Prop()
  varietal?: string;

  @Prop()
  notas?: string;

  @Prop({ required: true, min: 1 })
  pesoInicial!: number;

  @Prop({ required: true, min: 0 })
  pesoRestante!: number;

  @Prop()
  moliendaSugerida?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const BolsaCafeSchema = SchemaFactory.createForClass(BolsaCafeDocument);


