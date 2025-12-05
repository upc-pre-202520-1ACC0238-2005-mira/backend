import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'El título es requerido' })
  @IsString({ message: 'El título debe ser un texto' })
  title!: string;

  @IsNotEmpty({ message: 'La descripción es requerida' })
  @IsString({ message: 'La descripción debe ser un texto' })
  description!: string;

  @IsNotEmpty({ message: 'El negocio es requerido' })
  @IsString({ message: 'El ID del negocio debe ser válido' })
  businessId!: string;

  @IsNotEmpty({ message: 'El usuario asignado es requerido' })
  @IsString({ message: 'El ID del usuario asignado debe ser válido' })
  assignedToUserId!: string;

  @IsOptional()
  @IsArray({ message: 'Las imágenes deben ser un array' })
  @IsString({ each: true, message: 'Cada imagen debe ser una cadena base64' })
  images?: string[];

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed'], {
    message: 'El estado debe ser: pending, in_progress o completed',
  })
  status?: 'pending' | 'in_progress' | 'completed';
}
