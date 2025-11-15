import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RecetaDocument extends Document {
  @Prop({ required: true })
  nombre!: string;

  @Prop({ required: true })
  metodo!: string;

  @Prop()
  etiqueta?: string;

  @Prop()
  descripcion?: string;

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

  @Prop({ default: true })
  esPublica?: boolean;

  @Prop({ type: Object })
  configuracion?: {
    grind: string;
    temperature: string;
    base: {
      cafe_g: number;
      agua_total_ml: number;
    };
    total_time_seconds: number;
    steps: Array<{
      step: number;
      time_start: number;
      time_end: number;
      action: string;
      water_ml: number;
      calculation: string | null;
      requiere_accion_manual?: boolean;
    }>;
  };

  @Prop({ default: false })
  esPorDefecto?: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const RecetaSchema = SchemaFactory.createForClass(RecetaDocument);
