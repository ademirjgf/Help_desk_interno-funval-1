import {
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { TipoCategoria } from '../../prisma/generated/prisma/enums.js';

export class UpdateCategoriaDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(TipoCategoria)
  tipo?: TipoCategoria;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  sub_tipo?: string;
}
