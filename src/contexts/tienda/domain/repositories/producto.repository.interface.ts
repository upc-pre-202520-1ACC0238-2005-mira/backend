import { Producto } from '../entities/producto.entity';
import { BaseRepository } from '../../../shared/interfaces/base.repository';

export interface IProductoRepository extends BaseRepository<Producto> {
  findByName(nombre: string): Promise<Producto[]>;
  findInStock(): Promise<Producto[]>;
}
