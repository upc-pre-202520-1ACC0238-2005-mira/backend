import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class ReactMessageDto {
  @IsNotEmpty({ message: 'La reacción es requerida' })
  @IsString({ message: 'La reacción debe ser un texto' })
  @IsIn(['like', 'dislike'], { message: 'La reacción debe ser "like" o "dislike"' })
  reaction!: 'like' | 'dislike';
}
