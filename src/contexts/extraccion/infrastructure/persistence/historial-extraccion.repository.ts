import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IHistorialExtraccionRepository } from '../../domain/repositories/historial-extraccion.repository.interface';
import { HistorialExtraccion } from '../../domain/entities/historial-extraccion.entity';
import { HistorialExtraccionDocument } from '../schemas/historial-extraccion.schema';

@Injectable()
export class HistorialExtraccionRepository
  implements IHistorialExtraccionRepository
{
  constructor(
    @InjectModel(HistorialExtraccionDocument.name)
    private readonly historialModel: Model<HistorialExtraccionDocument>,
  ) {}

  async findAll(): Promise<HistorialExtraccion[]> {
    const historiales = await this.historialModel
      .find()
      .sort({ fecha: -1 })
      .exec();
    return historiales.map(this.toEntity);
  }

  async findById(id: string): Promise<HistorialExtraccion | null> {
    const historial = await this.historialModel.findById(id).exec();
    return historial ? this.toEntity(historial) : null;
  }

  async findByUserId(userId: string): Promise<HistorialExtraccion[]> {
    const historiales = await this.historialModel
      .find({ userId })
      .sort({ fecha: -1 })
      .exec();
    return historiales.map(this.toEntity);
  }

  async create(data: Partial<HistorialExtraccion>): Promise<HistorialExtraccion> {
    const newHistorial = new this.historialModel(data);
    const savedHistorial = await newHistorial.save();
    return this.toEntity(savedHistorial);
  }

  async update(
    id: string,
    data: Partial<HistorialExtraccion>,
  ): Promise<HistorialExtraccion | null> {
    const updatedHistorial = await this.historialModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    return updatedHistorial ? this.toEntity(updatedHistorial) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.historialModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  private toEntity(doc: HistorialExtraccionDocument): HistorialExtraccion {
    return {
      id: (doc._id as any).toString(),
      userId: doc.userId,
      metodoNombre: doc.metodoNombre,
      valoracionGeneral: doc.valoracionGeneral,
      perfilSensorial: doc.perfilSensorial,
      notasSensoriales: doc.notasSensoriales,
      fecha: doc.fecha,
    };
  }
}


