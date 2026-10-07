import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTareaDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsInt()
  @Min(1)
  id_categoria: number;
}
