import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BolsaCafeDocument } from '../schemas/bolsa-cafe.schema';
import { BolsaCafe } from '../../domain/entities/bolsa-cafe.entity';
import { IBolsaCafeRepository } from '../../domain/repositories/bolsa-cafe.repository.interface';

@Injectable()
export class BolsaCafeRepository implements IBolsaCafeRepository {
  constructor(
    @InjectModel(BolsaCafeDocument.name)
    private readonly bolsaCafeModel: Model<BolsaCafeDocument>,
  ) {}

  async findById(id: string): Promise<BolsaCafe | null> {
    const doc = await this.bolsaCafeModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findByUsuarioId(usuarioId: string): Promise<BolsaCafe[]> {
    const docs = await this.bolsaCafeModel
      .find({ usuarioId })
      .sort({ updatedAt: -1 })
      .exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async create(data: Partial<BolsaCafe>): Promise<BolsaCafe> {
    const created = await this.bolsaCafeModel.create({
      ...data,
      pesoRestante: data.pesoRestante ?? data.pesoInicial,
    });
    return this.toEntity(created);
  }

  async update(id: string, data: Partial<BolsaCafe>): Promise<BolsaCafe | null> {
    const updated = await this.bolsaCafeModel
      .findByIdAndUpdate(
        id,
        { $set: data },
        { new: true },
      )
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.bolsaCafeModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async consumirCafe(id: string, gramos: number): Promise<BolsaCafe> {
    const bolsa = await this.bolsaCafeModel.findById(id).exec();
    if (!bolsa) {
      throw new NotFoundException('Bolsa de café no encontrada');
    }

    if (gramos <= 0) {
      throw new BadRequestException('Los gramos a consumir deben ser mayores a cero');
    }

    if (bolsa.pesoRestante < gramos) {
      throw new BadRequestException(
        `No hay suficiente café disponible. Restante: ${bolsa.pesoRestante} g`,
      );
    }

    bolsa.pesoRestante = Number((bolsa.pesoRestante - gramos).toFixed(2));
    await bolsa.save();
    return this.toEntity(bolsa);
  }

  private toEntity(doc: BolsaCafeDocument): BolsaCafe {
    return {
      id: doc.id,
      usuarioId: doc.usuarioId,
      nombre: doc.nombre,
      origen: doc.origen,
      tostador: doc.tostador,
      varietal: doc.varietal,
      notas: doc.notas,
      pesoInicial: doc.pesoInicial,
      pesoRestante: doc.pesoRestante,
      moliendaSugerida: doc.moliendaSugerida,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}


