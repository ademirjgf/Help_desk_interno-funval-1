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

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets/:idTicket/comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // US-15: Añadir un comentario a un ticket

  @Post()
  async crear(
    @Param('idTicket', ParseIntPipe) idTicket: number,
    @Body() dto: CreateComentarioDto,
    @Request() req: any,
  ) {
    return await this.comentariosService.crearComentario(
      idTicket,
      req.user,
      dto,
    );
  }

  //* US-16: Consultar el historial de comentarios en orden cronológico
  //* GET /tickets/:idTicket/comentarios

  @Get()
  async obtenerHistorial(
    @Param('idTarea', ParseIntPipe) idTarea: number,
    @Request() req: any,
  ) {
    return await this.comentariosService.obtenerHistorial(idTarea, req.user);
  }
}
