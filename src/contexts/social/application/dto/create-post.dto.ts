import { IsNotEmpty, IsString, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  autor: string;

  @IsNotEmpty()
  @IsString()
  contenido: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fecha?: Date;
}
