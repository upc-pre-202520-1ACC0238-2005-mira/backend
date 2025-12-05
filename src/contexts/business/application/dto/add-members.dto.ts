import { IsNotEmpty, IsArray, IsString } from 'class-validator';

export class AddMembersDto {
  @IsNotEmpty({ message: 'La lista de usuarios es requerida' })
  @IsArray({ message: 'Los usuarios deben ser un array' })
  @IsString({ each: true, message: 'Cada usuario debe ser un ID válido' })
  userIds!: string[];
}
