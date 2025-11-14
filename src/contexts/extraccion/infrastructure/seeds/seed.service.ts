import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { IRecetaRepository } from '../../domain/repositories/receta.repository.interface';
import { RecetaDocument } from '../schemas/receta.schema';
import { RECETAS_POR_DEFECTO } from './recetas-default.seed';

@Injectable()
export class RecetaSeedService implements OnModuleInit {
  constructor(
    @Inject('IRecetaRepository')
    private readonly recetaRepository: IRecetaRepository,
    @InjectModel(RecetaDocument.name)
    private readonly recetaModel: Model<RecetaDocument>,
  ) {}

  async onModuleInit() {
    await this.seedRecetasPorDefecto();
  }

  private async seedRecetasPorDefecto() {
    try {
      console.log('📦 Verificando recetas por defecto...');
      
      let recetasInsertadas = 0;
      let recetasDuplicadas = 0;

      // Verificar e insertar cada receta individualmente para evitar duplicados
      for (const recetaData of RECETAS_POR_DEFECTO) {
        // Verificar si ya existe una receta con el mismo nombre y método
        const recetaExistente = await this.recetaModel.findOne({
          nombre: recetaData.nombre,
          metodo: recetaData.metodo,
        });

        if (recetaExistente) {
          console.log(
            `⚠️  Receta duplicada encontrada: ${recetaData.nombre} (${recetaData.metodo}) - Omitiendo`,
          );
          recetasDuplicadas++;
          continue;
        }

        // Insertar solo si no existe
        await this.recetaRepository.create(recetaData);
        recetasInsertadas++;
        console.log(
          `✅ Receta insertada: ${recetaData.nombre} (${recetaData.metodo})`,
        );
      }

      if (recetasInsertadas > 0) {
        console.log(
          `✅ Se insertaron ${recetasInsertadas} recetas por defecto`,
        );
      }
      if (recetasDuplicadas > 0) {
        console.log(
          `⚠️  Se omitieron ${recetasDuplicadas} recetas duplicadas`,
        );
      }
      if (recetasInsertadas === 0 && recetasDuplicadas === 0) {
        console.log('✅ No hay recetas por defecto para insertar');
      }
    } catch (error) {
      console.error('❌ Error al insertar recetas por defecto:', error);
    }
  }
}

