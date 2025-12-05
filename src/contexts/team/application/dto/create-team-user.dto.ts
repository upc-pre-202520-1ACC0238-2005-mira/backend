import {
  IsNotEmpty,
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateTeamUserDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  image?: string;
}
