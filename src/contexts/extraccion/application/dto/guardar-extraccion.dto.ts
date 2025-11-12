import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PerfilSensorialDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  acidez!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  dulzor!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  amargor!: number;
}

export class GuardarExtraccionDto {
  @IsNotEmpty()
  @IsString()
  metodoNombre!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  valoracionGeneral!: number;

  @ValidateNested()
  @Type(() => PerfilSensorialDto)
  perfilSensorial!: PerfilSensorialDto;

  @IsOptional()
  @IsString()
  notasSensoriales?: string;
}


