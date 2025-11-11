export class Receta {
  id?: string;
  nombre: string;
  metodo: string;
  ratio: string;
  notas?: string;
  usuarioId: string;
  calificacion?: number;
  gramosCafe?: number;
  mililitrosAgua?: number;
  temperaturaAgua?: number;
  tiempoExtraccion?: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    nombre: string,
    metodo: string,
    ratio: string,
    usuarioId: string,
    notas?: string,
    calificacion?: number,
    gramosCafe?: number,
    mililitrosAgua?: number,
    temperaturaAgua?: number,
    tiempoExtraccion?: number,
  ) {
    this.nombre = nombre;
    this.metodo = metodo;
    this.ratio = ratio;
    this.notas = notas;
    this.usuarioId = usuarioId;
    this.calificacion = calificacion;
    this.gramosCafe = gramosCafe;
    this.mililitrosAgua = mililitrosAgua;
    this.temperaturaAgua = temperaturaAgua;
    this.tiempoExtraccion = tiempoExtraccion;
  }
}
