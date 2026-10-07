import { IsEnum, IsOptional } from 'class-validator';
import { Rol } from '../../prisma/generated/prisma/enums.js';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QueryUsuarioDto {
  @ApiPropertyOptional({
    description: 'Filtrar por rol de usuario',
    enum: Rol,
    example: Rol.EMPLEADO,
  })
  @IsOptional()
  @IsEnum(Rol, { message: 'El rol debe ser ADMIN, AGENTE o EMPLEADO' })
  rol?: Rol;
}
