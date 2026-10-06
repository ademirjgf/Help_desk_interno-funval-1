import {
  Controller,
  Get,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service.js';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(
    private readonly notificacionesService:
      NotificacionesService,
  ) {}

  @Get()
  listar(
    @Req()
    request: {
      user: {
        id: number;
      };
    },
  ) {
    return this.notificacionesService.listarPorUsuario(
      request.user.id,
    );
  }

  @Patch(':id/leida')
  marcarComoLeida(
    @Param('id') id: string,
    @Req()
    request: {
      user: {
        id: number;
      };
    },
  ) {
    return this.notificacionesService.marcarComoLeida(
      Number(id),
      request.user.id,
    );
  }
}