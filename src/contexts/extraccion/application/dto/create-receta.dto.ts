import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateRecetaDto {
  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @IsNotEmpty()
  @IsString()
  metodo!: string;

  @IsNotEmpty()
  @IsString()
  ratio!: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsNotEmpty()
  @IsString()
  usuarioId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  calificacion?: number;

  @IsOptional()
  @IsNumber()
  gramosCafe?: number;

  @IsOptional()
  @IsNumber()
  mililitrosAgua?: number;

  @IsOptional()
  @IsInt()
  temperaturaAgua?: number;

  @IsOptional()
  @IsInt()
  tiempoExtraccion?: number;
}
