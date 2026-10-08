import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Rol } from '../prisma/generated/prisma/enums.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CreateTareaDto } from './dto/create-tarea.dto.js';
import { UpdateTareaDto } from './dto/update-tarea.dto.js';
import { TareasService } from './tareas.service.js';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

type RequestConUsuario = Request & {
  user: {
    id: number;
    email: string;
    rol: Rol;
  };
};
@ApiTags('Tareas')
@Controller('tareas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  @ApiOperation({ summary: 'Registra una nueva Tarea.' })
  @Post()
  @Roles(Rol.EMPLEADO)
  @ApiBody({
    type: CreateTareaDto,
    examples: {
      ejemplo: {
        summary: 'Reportar una tarea',
        value: {
          titulo: 'No funciona mi computadora',
          descripcion: 'La computadora no enciende desde esta mañana.',
          id_categoria: 1,
        },
      },
    },
  })
  create(@Body() dto: CreateTareaDto, @Req() req: RequestConUsuario) {
    return this.tareasService.create(dto, req.user);
  }

  @ApiOperation({ summary: 'Lista todas las Tareas existentes.' })
  @Get()
  findAll(@Req() req: RequestConUsuario) {
    return this.tareasService.findAll(req.user);
  }

  @ApiOperation({
    summary:
      'Muestra un Reporte de Métricas sobre categorías y estados del momento.',
  })
  @Get('metricas')
  @Roles(Rol.ADMIN, Rol.AGENTE)
  metricas() {
    return this.tareasService.metricas();
  }

  @ApiOperation({ summary: 'Muestra una tarea, identificada por su ID.' })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestConUsuario,
  ) {
    return this.tareasService.findOne(id, req.user);
  }

  @ApiOperation({
    summary:
      'Selecciona una tarea por su ID, y le asigna un Agente para resolverla.',
  })
  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.AGENTE)
  @ApiBody({
    type: UpdateTareaDto,
    examples: {
      ejemplo: {
        summary: 'Asignar agente y poner la tarea en proceso',
        value: {
          id_agente: 2,
          estado: 'EN_PROCESO',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTareaDto,
    @Req() req: RequestConUsuario,
  ) {
    return this.tareasService.update(id, dto, req.user);
  }
}
