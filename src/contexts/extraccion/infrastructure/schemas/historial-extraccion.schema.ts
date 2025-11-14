import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class HistorialExtraccionDocument extends Document {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  metodoNombre!: string;

  @Prop({ required: true })
  valoracionGeneral!: number;

  @Prop({
    type: {
      acidez: { type: Number, required: true },
      dulzor: { type: Number, required: true },
      amargor: { type: Number, required: true },
    },
    required: true,
  })
  perfilSensorial!: {
    acidez: number;
    dulzor: number;
    amargor: number;
  };

  @Prop()
  notasSensoriales?: string;

  @Prop({ required: true })
  fecha!: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const HistorialExtraccionSchema = SchemaFactory.createForClass(
  HistorialExtraccionDocument,
);









