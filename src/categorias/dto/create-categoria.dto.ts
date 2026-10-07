import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { TipoCategoria } from '../../prisma/generated/prisma/enums.js';

export class CreateCategoriaDto {
  @IsEnum(TipoCategoria)
  tipo: TipoCategoria;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  sub_tipo: string;
}
