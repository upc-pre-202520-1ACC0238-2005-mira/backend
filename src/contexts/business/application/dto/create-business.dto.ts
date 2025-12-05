import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateBusinessDto {
  @IsNotEmpty({ message: 'El nombre del negocio es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  name!: string;

  @IsNotEmpty({ message: 'El tipo es requerido' })
  @IsString({ message: 'El tipo debe ser un texto' })
  type!: string;

  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @IsString({ message: 'El teléfono debe ser un texto' })
  phone!: string;

  @IsNotEmpty({ message: 'La dirección es requerida' })
  @IsString({ message: 'La dirección debe ser un texto' })
  address!: string;

  @IsNotEmpty({ message: 'La descripción es requerida' })
  @IsString({ message: 'La descripción debe ser un texto' })
  description!: string;

  @IsNotEmpty({ message: 'El logo es requerido' })
  @IsString({ message: 'El logo debe ser un string base64' })
  logo!: string;
}
