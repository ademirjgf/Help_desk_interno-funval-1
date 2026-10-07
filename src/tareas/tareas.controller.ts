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
import { ApiBody } from '@nestjs/swagger';

type RequestConUsuario = Request & {
  user: {
    id: number;
    email: string;
    rol: Rol;
  };
};

@Controller('tareas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

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

  @Get()
  findAll(@Req() req: RequestConUsuario) {
    return this.tareasService.findAll(req.user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestConUsuario,
  ) {
    return this.tareasService.findOne(id, req.user);
  }

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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTareaDto) {
    return this.tareasService.update(id, dto);
  }
}
