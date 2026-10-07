import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ComentariosService } from './comentarios.service.js';
import { CreateComentarioDto } from './dto/create-comentario.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js'; // Ajusta la ruta a tu Guard de Auth
import { RolesGuard } from '../common/guards/roles.guard.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Comentarios')
@ApiBearerAuth('JWT-auth') // Asocia la seguridad JWT definida en SwaggerBuilder
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tarea/:idtarea/comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // US-15: Añadir un comentario a un ticket

  @Post()
  @ApiOperation({
    summary: 'Añadir un comentario a una tarea existente',
    description:
      'Registra un nuevo comentario para una tarea especifico, La fecha y el autor se asignan automaticamente en el servidor.',
  })
  @ApiParam({
    name: 'idTarea',
    type: Number,
    description: 'ID unico de la tarea al que se agregará el comentario',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Comentario creado exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada no validos o ID de tarea incorrecto.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido. El empleado o agente no tiene acceso a esta tarea.',
  })
  @ApiResponse({
    status: 404,
    description: 'No encontrado. la tarea no existe.',
  })
  async crear(
    @Param('idTarea', ParseIntPipe) idTarea: number,
    @Body() dto: CreateComentarioDto,
    @Request() req: any,
  ) {
    return await this.comentariosService.crearComentario(
      idTarea,
      req.user,
      dto,
    );
  }

  //* US-16: Consultar el historial de comentarios en orden cronológico
  //* GET /tickets/:idTicket/comentarios

  @Get()
  @ApiOperation({
    summary: 'Obtener el historial de comentarios de una tarea',
    description:
      'Devuelve todos los comentarios asociados a una tarea en orden ascendente, incluyendo datos publicos del autor.',
  })
  @ApiParam({
    name: 'idTarea',
    type: Number,
    description: 'ID del tarea del cual se extraera el historial',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de comentarios recuperado exitosamente.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido. No tienes permisos para ver los comentarios de esta tarea.',
  })
  @ApiResponse({
    status: 404,
    description: 'No encontrado, la tarea no existe.',
  })
  async obtenerHistorial(
    @Param('idTarea', ParseIntPipe) idTarea: number,
    @Request() req: any,
  ) {
    return await this.comentariosService.obtenerHistorial(idTarea, req.user);
  }
}
