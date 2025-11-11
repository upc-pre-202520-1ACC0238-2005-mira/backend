import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IRecetaRepository } from '../../domain/repositories/receta.repository.interface';
import { Receta } from '../../domain/entities/receta.entity';
import { RecetaDocument } from '../schemas/receta.schema';

@Injectable()
export class RecetaRepository implements IRecetaRepository {
  constructor(
    @InjectModel(RecetaDocument.name)
    private readonly recetaModel: Model<RecetaDocument>,
  ) {}

  async findAll(): Promise<Receta[]> {
    const recetas = await this.recetaModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
    return recetas.map((receta) => this.toEntity(receta));
  }

  async findById(id: string): Promise<Receta | null> {
    const receta = await this.recetaModel.findById(id).exec();
    return receta ? this.toEntity(receta) : null;
  }

  async findByMetodo(metodo: string): Promise<Receta[]> {
    const recetas = await this.recetaModel
      .find({ metodo })
      .sort({ createdAt: -1 })
      .exec();
    return recetas.map((receta) => this.toEntity(receta));
  }

  async findByUsuarioId(usuarioId: string, limit?: number): Promise<Receta[]> {
    const query = this.recetaModel.find({ usuarioId }).sort({ createdAt: -1 });
    if (limit && limit > 0) {
      query.limit(limit);
    }
    const recetas = await query.exec();
    return recetas.map((receta) => this.toEntity(receta));
  }

  async create(data: Partial<Receta>): Promise<Receta> {
    const newReceta = new this.recetaModel(data);
    const savedReceta = await newReceta.save();
    return this.toEntity(savedReceta);
  }

  async update(id: string, data: Partial<Receta>): Promise<Receta | null> {
    const updatedReceta = await this.recetaModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    return updatedReceta ? this.toEntity(updatedReceta) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.recetaModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  private toEntity(recetaDoc: RecetaDocument): Receta {
    return {
      id: (recetaDoc._id as any).toString(),
      nombre: recetaDoc.nombre,
      metodo: recetaDoc.metodo,
      ratio: recetaDoc.ratio,
      notas: recetaDoc.notas,
      usuarioId: recetaDoc.usuarioId,
      calificacion: recetaDoc.calificacion,
      gramosCafe: recetaDoc.gramosCafe,
      mililitrosAgua: recetaDoc.mililitrosAgua,
      temperaturaAgua: recetaDoc.temperaturaAgua,
      tiempoExtraccion: recetaDoc.tiempoExtraccion,
      createdAt: recetaDoc.createdAt,
      updatedAt: recetaDoc.updatedAt,
    };
  }
}
