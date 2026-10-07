import {
  IsEnum,
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { EstadoTicket } from '../../prisma/generated/prisma/enums.js';

export class UpdateTareaDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  titulo?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  descripcion?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(1)
  id_categoria?: number;

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsInt()
  @Min(1)
  id_agente?: number | null;

  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(EstadoTicket)
  estado?: EstadoTicket;
}
