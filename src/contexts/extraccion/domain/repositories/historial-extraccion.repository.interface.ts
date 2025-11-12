import { BaseRepository } from '../../../shared/interfaces/base.repository';
import { HistorialExtraccion } from '../entities/historial-extraccion.entity';

export interface IHistorialExtraccionRepository
  extends BaseRepository<HistorialExtraccion> {
  findByUserId(userId: string): Promise<HistorialExtraccion[]>;
}




