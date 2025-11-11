import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecetaDocument } from '../schemas/receta.schema';

@Injectable()
export class ExtraccionSeeder implements OnModuleInit {
  private readonly logger = new Logger(ExtraccionSeeder.name);

  constructor(
    @InjectModel(RecetaDocument.name)
    private readonly recetaModel: Model<RecetaDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.recetaModel.estimatedDocumentCount();
    if (count > 0) {
      return;
    }

    const defaultRecetas: Array<Record<string, unknown>> = [
      {
        nombre: 'Prensa Francesa clásica',
        metodo: 'Prensa Francesa',
        ratio: '1:15',
        notas: 'Cuerpo completo y sabores intensos.',
        usuarioId: 'admin',
        calificacion: 5,
        gramosCafe: 30,
        mililitrosAgua: 450,
        temperaturaAgua: 93,
        tiempoExtraccion: 240,
        esPublica: true,
      },
      {
        nombre: 'V60 brillante',
        metodo: 'V60',
        ratio: '1:16',
        notas: 'Claridad en taza con notas frutales.',
        usuarioId: 'admin',
        calificacion: 5,
        gramosCafe: 18,
        mililitrosAgua: 288,
        temperaturaAgua: 92,
        tiempoExtraccion: 180,
        esPublica: true,
      },
      {
        nombre: 'Chemex elegante',
        metodo: 'Chemex',
        ratio: '1:17',
        notas: 'Café limpio y balanceado.',
        usuarioId: 'admin',
        calificacion: 4,
        gramosCafe: 40,
        mililitrosAgua: 680,
        temperaturaAgua: 94,
        tiempoExtraccion: 300,
        esPublica: true,
      },
      {
        nombre: 'Aeropress express',
        metodo: 'Aeropress',
        ratio: '1:12',
        notas: 'Extracción rápida y consistente.',
        usuarioId: 'admin',
        calificacion: 4,
        gramosCafe: 17,
        mililitrosAgua: 200,
        temperaturaAgua: 85,
        tiempoExtraccion: 90,
        esPublica: true,
      },
      {
        nombre: 'Espresso clásico',
        metodo: 'Espresso',
        ratio: '1:2',
        notas: 'Shot intenso con final dulce.',
        usuarioId: 'admin',
        calificacion: 5,
        gramosCafe: 18,
        mililitrosAgua: 36,
        temperaturaAgua: 93,
        tiempoExtraccion: 30,
        esPublica: true,
      },
    ];

    try {
      await this.recetaModel.insertMany(defaultRecetas, { ordered: false });
      this.logger.log('Métodos base de extracción creados.');
    } catch (error) {
      this.logger.error('No se pudieron crear los métodos base.', error as Error);
    }
  }
}

