export class Receta {
  id?: string;
  nombre: string;
  metodo: string;
  ratio: string;
  notas?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(nombre: string, metodo: string, ratio: string, notas?: string) {
    this.nombre = nombre;
    this.metodo = metodo;
    this.ratio = ratio;
    this.notas = notas;
  }
}
