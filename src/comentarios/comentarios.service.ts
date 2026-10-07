import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js'; // Ajusta la ruta según tu proyecto
import { CreateComentarioDto } from './dto/create-comentario.dto.js';
import { Rol } from '../prisma/generated/prisma/enums.js';

@Injectable()
export class ComentariosService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. crear comentario manual
  async crearComentario(idTarea: number, user: any, dto: CreateComentarioDto) {
    const tarea = await this.prisma.tarea.findUnique({
      where: { id: idTarea },
    });

    if (!tarea) {
      throw new NotFoundException(`La tarea con ID ${idTarea} no existe.`);
    }

    // validamos la visibilidad de la tarea a los usuarios
    this.validarAccesoATarea(tarea, user);

    // transacción: crear comentario y generar la notificacion requerida
    return await this.prisma.$transaction(async (tx) => {
      const nuevoComentario = await tx.comentario.create({
        data: {
          descripcion: dto.descripcion,
          estado_actual: dto.estado_actual ?? null,
          id_tarea: idTarea,
          id_autor: user.id, // Registrado por el sistema automaticamente
        },
      });

      // determinar a quien va dirigida la notificacion
      const destinatarioId =
        user.rol === Rol.EMPLEADO ? tarea.id_agente : tarea.id_empleado;

      // generar notificacion si existe destinatario asignado
      if (destinatarioId) {
        await tx.notificacion.create({
          data: {
            leido: false,
            id_comentario: nuevoComentario.id,
            id_usuario: destinatarioId,
          },
        });
      }

      return nuevoComentario;
    });
  }

  // 2. funcion interna para que el modulo de TAREAS cree comentarios de sistema
  async crearComentarioSistema(
    idTarea: number,
    idAutor: number,
    descripcion: string,
    nuevoEstado?: any,
    idUsuarioANotificar?: number,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const comentario = await tx.comentario.create({
        data: {
          descripcion,
          estado_actual: nuevoEstado ?? null,
          id_tarea: idTarea,
          id_autor: idAutor,
        },
      });

      if (idUsuarioANotificar) {
        await tx.notificacion.create({
          data: {
            leido: false,
            id_comentario: comentario.id,
            id_usuario: idUsuarioANotificar,
          },
        });
      }

      return comentario;
    });
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
