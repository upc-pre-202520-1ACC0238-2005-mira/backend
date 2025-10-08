import { Receta } from '../entities/receta.entity';
import { BaseRepository } from '../../../shared/interfaces/base.repository';

export interface IRecetaRepository extends BaseRepository<Receta> {
  findByMetodo(metodo: string): Promise<Receta[]>;
}
