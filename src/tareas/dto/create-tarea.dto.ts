import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PrioridadTarea } from '../../prisma/generated/prisma/enums.js';

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

  @ApiPropertyOptional({
    enum: PrioridadTarea,
    example: PrioridadTarea.ALTA,
  })
  @IsOptional()
  @IsEnum(PrioridadTarea)
  prioridad?: PrioridadTarea;
}
