import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

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
}
