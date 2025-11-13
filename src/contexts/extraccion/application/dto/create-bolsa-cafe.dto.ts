import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, MaxLength } from 'class-validator';

export class CreateBolsaCafeDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  nombre!: string;

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

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  pesoInicial!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pesoRestante?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  moliendaSugerida?: string;
}


