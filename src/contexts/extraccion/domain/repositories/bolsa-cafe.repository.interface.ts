import { BolsaCafe } from '../entities/bolsa-cafe.entity';

export interface IBolsaCafeRepository {
  findById(id: string): Promise<BolsaCafe | null>;
  findByUsuarioId(usuarioId: string): Promise<BolsaCafe[]>;
  create(data: Partial<BolsaCafe>): Promise<BolsaCafe>;
  update(id: string, data: Partial<BolsaCafe>): Promise<BolsaCafe | null>;
  delete(id: string): Promise<boolean>;
  consumirCafe(id: string, gramos: number): Promise<BolsaCafe>;
}






