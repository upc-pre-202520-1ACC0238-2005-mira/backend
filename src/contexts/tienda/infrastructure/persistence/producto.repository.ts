import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IProductoRepository } from '../../domain/repositories/producto.repository.interface';
import { Producto } from '../../domain/entities/producto.entity';
import { ProductoDocument } from '../schemas/producto.schema';

@Injectable()
export class ProductoRepository implements IProductoRepository {
  constructor(
    @InjectModel(ProductoDocument.name)
    private readonly productoModel: Model<ProductoDocument>,
  ) {}

  async findAll(): Promise<Producto[]> {
    const productos = await this.productoModel.find().exec();
    return productos.map((producto) => this.toEntity(producto));
  }

  async findById(id: string): Promise<Producto | null> {
    const producto = await this.productoModel.findById(id).exec();
    return producto ? this.toEntity(producto) : null;
  }

  async findByName(nombre: string): Promise<Producto[]> {
    const productos = await this.productoModel
      .find({ nombre: new RegExp(nombre, 'i') })
      .exec();
    return productos.map((producto) => this.toEntity(producto));
  }

  async findInStock(): Promise<Producto[]> {
    const productos = await this.productoModel.find({ stock: { $gt: 0 } }).exec();
    return productos.map((producto) => this.toEntity(producto));
  }

  async create(data: Partial<Producto>): Promise<Producto> {
    const newProducto = new this.productoModel(data);
    const savedProducto = await newProducto.save();
    return this.toEntity(savedProducto);
  }

  async update(id: string, data: Partial<Producto>): Promise<Producto | null> {
    const updatedProducto = await this.productoModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    return updatedProducto ? this.toEntity(updatedProducto) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productoModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  private toEntity(productoDoc: ProductoDocument): Producto {
    return {
      id: (productoDoc._id as any).toString(),
      nombre: productoDoc.nombre,
      precio: productoDoc.precio,
      stock: productoDoc.stock,
      descripcion: productoDoc.descripcion,
      createdAt: productoDoc.createdAt,
      updatedAt: productoDoc.updatedAt,
    };
  }
}
