export class Producto {
  id?: string;
  nombre: string;
  precio: number;
  stock: number;
  descripcion?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(nombre: string, precio: number, stock: number, descripcion?: string) {
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
    this.descripcion = descripcion;
  }
}
