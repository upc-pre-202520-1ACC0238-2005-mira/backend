import {
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
} from 'class-validator';

export class UpdateTeamUserDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser un string base64' })
  image?: string;
}
