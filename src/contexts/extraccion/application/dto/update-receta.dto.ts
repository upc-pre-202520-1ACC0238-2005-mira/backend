import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class UpdateRecetaDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  metodo?: string;

  @IsOptional()
  @IsString()
  ratio?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsString()
  usuarioId?: string;

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
