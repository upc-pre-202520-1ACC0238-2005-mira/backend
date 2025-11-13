import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class ConsumirBolsaCafeDto {
  @IsNotEmpty()
  bolsaId!: string;

  @IsNumber()
  @Min(0.1)
  gramos!: number;
}


