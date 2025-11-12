import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  content!: string;

  @IsOptional()
  @IsString()
  parentCommentId?: string;
}

