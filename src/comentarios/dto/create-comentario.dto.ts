import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoTicket } from '../../prisma/generated/prisma/enums.js';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateComentarioDto {
  @ApiPropertyOptional({
    description:
      'Texto o detalle del comentario enviado por el usuario o agente.',
    example:
      'Se procedió con la revisión del equipo y se reinició el servicio.',
    maxLength: 500,
  })
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
