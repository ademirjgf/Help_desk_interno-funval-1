import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js'; // Ajusta la ruta según tu proyecto
import { CreateComentarioDto } from './dto/create-comentario.dto.js';
import { Rol } from '../prisma/generated/prisma/enums.js';
import { NotificacionesService } from '../notificaciones/notificaciones.service.js';

@Injectable()
export class ComentariosService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly notificacionesService: NotificacionesService,
) {}

  // 1. crear comentario manual
  async crearComentario(idTarea: number, user: any, dto: CreateComentarioDto) {
  const tarea = await this.prisma.tarea.findUnique({
    where: { id: idTarea },
  });

  if (!tarea) {
    throw new NotFoundException(`La tarea con ID ${idTarea} no existe.`);
  }

  this.validarAccesoATarea(tarea, user);

  // Primero guardamos el comentario
  const nuevoComentario = await this.prisma.comentario.create({
    data: {
      descripcion: dto.descripcion,
      estado_actual: dto.estado_actual ?? tarea.estado,
      id_tarea: idTarea,
      id_autor: user.id,
    },
  });

  const destinatarioId =
    user.rol === Rol.EMPLEADO ? tarea.id_agente : tarea.id_empleado;

  // La notificación no debe impedir que el comentario quede guardado
  if (destinatarioId !== null && destinatarioId !== undefined) {
    try {
      await this.notificacionesService.crear(
        destinatarioId,
        nuevoComentario.id,
      );
    } catch (error) {
      console.error('Error al generar notificación:', error);
    }
  }

  return nuevoComentario;
}
  // 2. funcion interna para que el modulo de TAREAS cree comentarios de sistema
  async crearComentarioSistema(
  idTarea: number,
  idAutor: number,
  descripcion: string,
  nuevoEstado?: any,
  idUsuarioANotificar?: number,
) {
  const comentario = await this.prisma.comentario.create({
    data: {
      descripcion,
      estado_actual: nuevoEstado ?? null,
      id_tarea: idTarea,
      id_autor: idAutor,
    },
  });

  if (idUsuarioANotificar !== undefined) {
    try {
      await this.notificacionesService.crear(
        idUsuarioANotificar,
        comentario.id,
      );
    } catch (error) {
      console.error('Error al generar notificación:', error);
    }
  }

  return comentario;
}

  // 3. Consultar historial en orden cronológico
  async obtenerHistorial(idTarea: number, user: any) {
    const tarea = await this.prisma.tarea.findUnique({
      where: { id: idTarea },
    });

    if (!tarea) {
      throw new NotFoundException(`La tarea con ID ${idTarea} no existe.`);
    }

    this.validarAccesoATarea(tarea, user);

    return this.prisma.comentario.findMany({
      where: { id_tarea: idTarea },
      orderBy: { fecha: 'asc' }, // Orden cronológico
      select: {
        id: true,
        descripcion: true,
        estado_actual: true,
        fecha: true,
        autor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rol: true,
          },
        },
      },
    });
  }

  // Auxiliar de validación de permisos por Rol
  private validarAccesoATarea(tarea: any, user: any) {
    if (user.rol === Rol.ADMIN) return;

    if (
      user.rol === Rol.EMPLEADO &&
      Number(tarea.id_empleado) !== Number(user.id)
    ) {
      throw new ForbiddenException(
        'No tienes acceso a los comentarios de esta tarea',
      );
    }

    if (
      user.rol === Rol.AGENTE &&
      Number(tarea.id_agente) !== Number(user.id)
    ) {
      throw new ForbiddenException(
        'Solo puedes interactuar con las tareas que se te asigno',
      );
    }
  }
}
