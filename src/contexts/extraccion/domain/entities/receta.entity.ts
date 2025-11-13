export interface PasoExtraccion {
  step: number;
  time_start: number;
  time_end: number;
  action: string;
  water_ml: number;
  calculation: string | null;
  requiere_accion_manual?: boolean; // Indica si se debe esperar acción del usuario
}

export interface ConfiguracionMetodo {
  grind: string;
  temperature: string;
  base: {
    cafe_g: number;
    agua_total_ml: number;
  };
  total_time_seconds: number;
  steps: PasoExtraccion[];
}

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
  esPublica?: boolean;
  configuracion?: ConfiguracionMetodo; // Nueva propiedad para recetas con pasos
  esPorDefecto?: boolean; // Marca las recetas por defecto del sistema
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
    esPublica?: boolean,
    configuracion?: ConfiguracionMetodo,
    esPorDefecto?: boolean,
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
    this.esPublica = esPublica ?? true;
    this.configuracion = configuracion;
    this.esPorDefecto = esPorDefecto ?? false;
  }
}
