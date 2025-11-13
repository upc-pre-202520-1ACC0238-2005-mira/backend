import { IsOptional, IsString, IsNumber, Min, MaxLength } from 'class-validator';

export class UpdateBolsaCafeDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  origen?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  tostador?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  varietal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  notas?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  pesoInicial?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pesoRestante?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  moliendaSugerida?: string;
}



