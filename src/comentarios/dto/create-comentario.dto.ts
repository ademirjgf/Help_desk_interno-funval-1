import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoTicket } from '../../prisma/generated/prisma/enums.js';

export class CreateComentarioDto {
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @MaxLength(500, {
    message: 'La descripción no puede exceder 500 caracteres.',
  })
  descripcion?: string;

  @IsOptional()
  @IsEnum(EstadoTicket, {
    message: 'El estado actual debe ser un valor válido.',
  })
  estado_actual?: EstadoTicket;
}
