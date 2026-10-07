import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Rol } from '../prisma/generated/prisma/enums.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
import { CategoriasService } from './categorias.service.js';
import { ApiBody } from '@nestjs/swagger';

@Controller('categorias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  // Cualquier usuario autenticado puede consultar las categorías.
  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findOne(id);
  }

  // ADMIN y AGENTE son personal interno.
  @Post()
  @Roles(Rol.ADMIN, Rol.AGENTE)
  @ApiBody({
    type: CreateCategoriaDto,
    examples: {
      ejemplo: {
        summary: 'Crear una categoría de incidencia',
        value: {
          tipo: 'INCIDENCIA',
          sub_tipo: 'Hardware',
        },
      },
    },
  })
  create(@Body() dto: CreateCategoriaDto) {
    return this.categoriasService.create(dto);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.AGENTE)
  @ApiBody({
    type: UpdateCategoriaDto,
    examples: {
      ejemplo: {
        summary: 'Actualizar una categoría',
        value: {
          tipo: 'REQUERIMIENTO',
          sub_tipo: 'Acceso a correo',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.AGENTE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.remove(id);
  }
}
