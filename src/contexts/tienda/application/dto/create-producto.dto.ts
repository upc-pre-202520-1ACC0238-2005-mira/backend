import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateProductoDto {
  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precio!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock!: number;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
