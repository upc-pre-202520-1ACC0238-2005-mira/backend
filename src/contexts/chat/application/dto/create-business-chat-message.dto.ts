import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBusinessChatMessageDto {
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  @IsString({ message: 'El mensaje debe ser un texto' })
  message!: string;
}
