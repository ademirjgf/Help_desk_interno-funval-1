import { Module } from '@nestjs/common';
import { NotificacionesController } from './notificaciones.controller.js';
import { NotificacionesService } from './notificaciones.service.js';
import { NotificacionesGateway } from './notificaciones.gateway.js';

@Module({
  controllers: [NotificacionesController],
  providers: [
    NotificacionesService,
    NotificacionesGateway,
  ],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}