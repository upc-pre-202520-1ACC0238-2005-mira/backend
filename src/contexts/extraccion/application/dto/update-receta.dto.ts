import { IsOptional, IsString } from 'class-validator';

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
}
