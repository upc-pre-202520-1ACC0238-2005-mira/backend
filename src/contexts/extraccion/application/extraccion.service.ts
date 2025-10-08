import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IRecetaRepository } from '../domain/repositories/receta.repository.interface';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { Receta } from '../domain/entities/receta.entity';

@Injectable()
export class ExtraccionService {
  constructor(
    @Inject('IRecetaRepository')
    private readonly recetaRepository: IRecetaRepository,
  ) {}

  async findAll(): Promise<Receta[]> {
    return this.recetaRepository.findAll();
  }

  async findById(id: string): Promise<Receta> {
    const receta = await this.recetaRepository.findById(id);
    if (!receta) {
      throw new NotFoundException(`Receta with id ${id} not found`);
    }
    return receta;
  }

  async findByMetodo(metodo: string): Promise<Receta[]> {
    return this.recetaRepository.findByMetodo(metodo);
  }

  async create(createRecetaDto: CreateRecetaDto): Promise<Receta> {
    return this.recetaRepository.create(createRecetaDto);
  }

  async update(id: string, updateRecetaDto: UpdateRecetaDto): Promise<Receta> {
    const receta = await this.recetaRepository.update(id, updateRecetaDto);
    if (!receta) {
      throw new NotFoundException(`Receta with id ${id} not found`);
    }
    return receta;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.recetaRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Receta with id ${id} not found`);
    }
  }
}
