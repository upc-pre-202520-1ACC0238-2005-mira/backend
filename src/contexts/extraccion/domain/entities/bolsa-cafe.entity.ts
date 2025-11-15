export class BolsaCafe {
  id?: string;
  usuarioId: string;
  nombre: string;
  origen?: string;
  tostador?: string;
  varietal?: string;
  notas?: string;
  pesoInicial: number;
  pesoRestante: number;
  moliendaSugerida?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    usuarioId: string,
    nombre: string,
    pesoInicial: number,
    pesoRestante?: number,
    origen?: string,
    tostador?: string,
    varietal?: string,
    notas?: string,
    moliendaSugerida?: string,
  ) {
    this.usuarioId = usuarioId;
    this.nombre = nombre;
    this.pesoInicial = pesoInicial;
    this.pesoRestante = pesoRestante ?? pesoInicial;
    this.origen = origen;
    this.tostador = tostador;
    this.varietal = varietal;
    this.notas = notas;
    this.moliendaSugerida = moliendaSugerida;
  }
}






