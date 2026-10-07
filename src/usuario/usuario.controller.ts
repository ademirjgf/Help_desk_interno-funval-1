import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QueryUsuarioDto } from './dto/query-usuario.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  // @ApiOperation({ summary: 'Registra un nuevo Usuario' })
  // @Post()
  // create(@Body() createUsuarioDto: CreateUsuarioDto) {
  //   return this.usuarioService.create(createUsuarioDto);
  // }

  @Roles('ADMIN', 'AGENTE')
  @ApiOperation({ summary: 'Lista todos los Usuarios' })
  @Get()
  findAll(@Query() query: QueryUsuarioDto) {
    return this.usuarioService.findAll(query);
  }

  @ApiOperation({ summary: 'Muestra un Usuario, identificado por su ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(+id);
  }

  @ApiOperation({
    summary: 'Actualiza algun dato de un Usuario identificado por su ID',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(+id, updateUsuarioDto);
  }

  @ApiOperation({ summary: 'Elimina un Usuario identificado por su ID' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(+id);
  }
}
