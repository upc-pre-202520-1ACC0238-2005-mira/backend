import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CompleteExtractionDto {
  @IsNotEmpty()
  @IsString()
  recetaId!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  notasDeCata!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  sabor?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  aroma?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  cuerpo?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  acidez?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNotEmpty()
  publishToSocial!: boolean; // true = publicar, false = solo guardar privado
}

