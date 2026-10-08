import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificacionesGateway } from './notificaciones.gateway.js';

@Injectable()
export class NotificacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificacionesGateway,
  ) {}

  async crear(
    idUsuario: number,
    idComentario: number,
  ) {
    
    const notificacion =
      await this.prisma.notificacion.create({
        data: {
          id_usuario: idUsuario,
          id_comentario: idComentario,
        },
        include: {
          comentario: true,
        },
      });

    this.gateway.emitirAUsuario(
      idUsuario,
      notificacion,
    );

    return notificacion;
  }

  async listarPorUsuario(idUsuario: number) {
    return this.prisma.notificacion.findMany({
      where: {
        id_usuario: idUsuario,
      },
      include: {
        comentario: true,
      },
      orderBy: {
        created: 'desc',
      },
    });
  }

  async marcarComoLeida(
    idNotificacion: number,
    idUsuario: number,
  ) {
    const notificacion =
      await this.prisma.notificacion.findFirst({
        where: {
          id: idNotificacion,
          id_usuario: idUsuario,
        },
      });

    if (!notificacion) {
      throw new NotFoundException(
        'Notificación no encontrada',
      );
    }

    return this.prisma.notificacion.update({
      where: {
        id: idNotificacion,
      },
      data: {
        leido: true,
      },
    });
  }
}