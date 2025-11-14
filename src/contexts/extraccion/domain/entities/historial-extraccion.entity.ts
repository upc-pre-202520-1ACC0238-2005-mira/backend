export class HistorialExtraccion {
  id?: string;
  userId: string;
  metodoNombre: string;
  valoracionGeneral: number;
  perfilSensorial: {
    acidez: number;
    dulzor: number;
    amargor: number;
  };
  notasSensoriales?: string;
  fecha: Date;

  constructor(
    userId: string,
    metodoNombre: string,
    valoracionGeneral: number,
    perfilSensorial: {
      acidez: number;
      dulzor: number;
      amargor: number;
    },
    notasSensoriales?: string,
  ) {
    this.userId = userId;
    this.metodoNombre = metodoNombre;
    this.valoracionGeneral = valoracionGeneral;
    this.perfilSensorial = perfilSensorial;
    this.notasSensoriales = notasSensoriales;
    this.fecha = new Date();
  }
}









