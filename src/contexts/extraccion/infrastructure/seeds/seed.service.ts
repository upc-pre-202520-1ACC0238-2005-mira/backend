import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { IRecetaRepository } from '../../domain/repositories/receta.repository.interface';
import { RECETAS_POR_DEFECTO } from './recetas-default.seed';

@Injectable()
export class RecetaSeedService implements OnModuleInit {
  constructor(
    @Inject('IRecetaRepository')
    private readonly recetaRepository: IRecetaRepository,
  ) {}

  async onModuleInit() {
    await this.seedRecetasPorDefecto();
  }

  private async seedRecetasPorDefecto() {
    try {
      // Verificar si ya existen recetas por defecto
      const recetasExistentes =
        await this.recetaRepository.findByUsuarioId('system');

      if (recetasExistentes && recetasExistentes.length > 0) {
        console.log('✅ Recetas por defecto ya existen en la base de datos');
        return;
      }

      // Insertar recetas por defecto
      console.log('📦 Insertando recetas por defecto...');
      for (const receta of RECETAS_POR_DEFECTO) {
        await this.recetaRepository.create(receta);
      }
      console.log(
        `✅ Se insertaron ${RECETAS_POR_DEFECTO.length} recetas por defecto`,
      );
    } catch (error) {
      console.error('❌ Error al insertar recetas por defecto:', error);
    }
  }
}

