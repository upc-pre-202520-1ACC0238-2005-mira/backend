import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  @IsString({ message: 'La contraseña actual debe ser un texto' })
  readonly currentPassword!: string;

  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @IsString({ message: 'La nueva contraseña debe ser un texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128, { message: 'La contraseña no puede exceder 128 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    {
      message:
        'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
    },
  )
  readonly newPassword!: string;
}
