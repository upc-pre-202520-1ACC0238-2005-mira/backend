export class Post {
  id?: string;
  autor: string;
  contenido: string;
  fecha: Date;
  likes: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(autor: string, contenido: string, fecha: Date = new Date(), likes: number = 0) {
    this.autor = autor;
    this.contenido = contenido;
    this.fecha = fecha;
    this.likes = likes;
  }
}
