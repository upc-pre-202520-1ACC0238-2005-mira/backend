import {
  IsNotEmpty,
  IsEmail,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateTeamUserDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  name!: string;

  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email!: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @IsNotEmpty({ message: 'La imagen de perfil es requerida' })
  @IsString({ message: 'La imagen debe ser un string base64' })
  image!: string;
}
