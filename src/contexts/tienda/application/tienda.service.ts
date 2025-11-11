import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IProductoRepository } from '../domain/repositories/producto.repository.interface';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Producto } from '../domain/entities/producto.entity';

@Injectable()
export class TiendaService {
  constructor(
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository,
  ) {}

  async findAll(): Promise<Producto[]> {
    return this.productoRepository.findAll();
  }

  async findById(id: string): Promise<Producto> {
    const producto = await this.productoRepository.findById(id);
    if (!producto) {
      throw new NotFoundException(`Producto with id ${id} not found`);
    }
    return producto;
  }

  async findByName(nombre: string): Promise<Producto[]> {
    return this.productoRepository.findByName(nombre);
  }

  async findInStock(): Promise<Producto[]> {
    return this.productoRepository.findInStock();
  }

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    return this.productoRepository.create(createProductoDto);
  }

  async update(
    id: string,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    const producto = await this.productoRepository.update(
      id,
      updateProductoDto,
    );
    if (!producto) {
      throw new NotFoundException(`Producto with id ${id} not found`);
    }
    return producto;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.productoRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Producto with id ${id} not found`);
    }
  }
}
