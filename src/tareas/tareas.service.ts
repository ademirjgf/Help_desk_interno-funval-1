import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Estado, EstadoTicket, Rol } from '../prisma/generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTareaDto } from './dto/create-tarea.dto.js';
import { UpdateTareaDto } from './dto/update-tarea.dto.js';
import { ComentariosService } from '../comentarios/comentarios.service.js';

type UsuarioAutenticado = {
  id: number;
  email: string;
  rol: Rol;
};

const relacionesTarea = {
  categoria: true,
  empleado: {
    select: { id: true, nombres: true, apellidos: true, email: true },
  },
  agente: {
    select: { id: true, nombres: true, apellidos: true, email: true },
  },
};

@Injectable()
export class TareasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly comentarioService: ComentariosService,
  ) {}

  async findAll(usuario: UsuarioAutenticado) {
    // Los empleados solo ven las tareas que reportaron.
    const where =
      usuario.rol === Rol.EMPLEADO ? { id_empleado: usuario.id } : {};

    return await this.prisma.tarea.findMany({
      where,
      include: relacionesTarea,
      orderBy: { created: 'desc' },
    });
  }

  async findOne(id: number, usuario: UsuarioAutenticado) {
    const tarea = await this.prisma.tarea.findUnique({
      where: { id },
      include: relacionesTarea,
    });

    if (!tarea) {
      throw new NotFoundException(`No existe la tarea con id ${id}.`);
    }

    // Se responde como inexistente para no revelar tareas ajenas al empleado.
    if (usuario.rol === Rol.EMPLEADO && tarea.id_empleado !== usuario.id) {
      throw new NotFoundException(`No existe la tarea con id ${id}.`);
    }

    return tarea;
  }

  async create(dto: CreateTareaDto, usuario: UsuarioAutenticado) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: dto.id_categoria },
    });

    if (!categoria) {
      throw new NotFoundException(
        `No existe la categoría con id ${dto.id_categoria}.`,
      );
    }

    const tareaCreada = await this.prisma.tarea.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        estado: EstadoTicket.ABIERTO,
        prioridad: dto.prioridad,
        empleado: { connect: { id: usuario.id } },
        categoria: { connect: { id: dto.id_categoria } },
      },
      include: relacionesTarea,
    });
    await this.comentarioService.crearComentarioSistema(
      tareaCreada.id,
      usuario.id,
      'Se ha registrado la solicitud en el sistema.',
      EstadoTicket.ABIERTO,
    );
    return tareaCreada;
  }

  async update(id: number, dto: UpdateTareaDto, usuario: UsuarioAutenticado) {
    const tarea = await this.prisma.tarea.findUnique({ where: { id } });
    if (
      tarea?.id_agente &&
      dto.id_agente !== usuario.id &&
      usuario.rol !== 'ADMIN'
    )
      throw new BadRequestException(
        `La Tarea ya esta asignada al Agente con id=${tarea.id_agente}`,
      );
    if (!tarea) {
      throw new NotFoundException(`No existe la tarea con id ${id}.`);
    }

    if (tarea.estado === EstadoTicket.CERRADO) {
      throw new ConflictException('No se puede modificar una tarea cerrada.');
    }

    if (dto.id_categoria !== undefined) {
      const categoria = await this.prisma.categoria.findUnique({
        where: { id: dto.id_categoria },
      });

      if (!categoria) {
        throw new NotFoundException(
          `No existe la categoría con id ${dto.id_categoria}.`,
        );
      }
    }

    if (dto.id_agente !== undefined && dto.id_agente !== null) {
      const agente = await this.prisma.usuario.findUnique({
        where: { id: dto.id_agente },
        select: { id: true, rol: true, estado: true },
      });

      if (
        !agente ||
        agente.rol !== Rol.AGENTE ||
        agente.estado !== Estado.ACTIVO
      ) {
        throw new BadRequestException(
          'El usuario asignado debe ser un agente activo.',
        );
      }
    }

    if (dto.estado && dto.estado !== tarea.estado) {
      const siguientesEstados: Record<EstadoTicket, EstadoTicket | null> = {
        ABIERTO: EstadoTicket.EN_PROCESO,
        EN_PROCESO: EstadoTicket.RESUELTO,
        RESUELTO: EstadoTicket.CERRADO,
        CERRADO: null,
      };

      if (siguientesEstados[tarea.estado] !== dto.estado) {
        throw new BadRequestException(
          `No se permite cambiar de ${tarea.estado} a ${dto.estado}.`,
        );
      }
    }

    const tareaActualizada = await this.prisma.tarea.update({
      where: { id },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo }),
        ...(dto.descripcion !== undefined && {
          descripcion: dto.descripcion,
        }),
        ...(dto.id_categoria !== undefined && {
          categoria: { connect: { id: dto.id_categoria } },
        }),
        ...(dto.id_agente === null && {
          agente: { disconnect: true },
        }),
        ...(dto.id_agente !== undefined &&
          dto.id_agente !== null && {
            agente: { connect: { id: dto.id_agente } },
          }),
        ...(dto.estado !== undefined && { estado: dto.estado }),
        ...(dto.prioridad !== undefined && {
          prioridad: dto.prioridad,
        }),
        ...(dto.estado !== undefined && { estado: dto.estado }),
        ...(dto.estado === EstadoTicket.RESUELTO &&
          tarea.estado !== EstadoTicket.RESUELTO && {
            resueltoEn: new Date(),
          }),
        ...(dto.estado === EstadoTicket.CERRADO && {
          cerradoEn: new Date(),
        }),
      },
      include: relacionesTarea,
    });

    if (dto.estado !== undefined && dto.estado !== tarea.estado) {
      await this.comentarioService.crearComentarioSistema(
        tareaActualizada.id,
        usuario.id,
        `El agente asignado cambió el estado del ticket a ${dto.estado}.`,
        dto.estado,
        tarea.id_empleado ?? undefined,
      );
    }

    return tareaActualizada;
  }

  async metricas() {
    // 1. Agrupamos y contamos las tareas
    const conteosAgrupados = await this.prisma.tarea.groupBy({
      by: ['id_categoria', 'estado'],
      _count: {
        _all: true, // Cuenta el total de registros en cada grupo
      },
    });

    // 2. Traemos las categorías para asociar los IDs con sus nombres/subtipos reales
    const categorias = await this.prisma.categoria.findMany({
      select: {
        id: true,
        tipo: true,
        sub_tipo: true,
      },
    });

    // Creamos un mapa rápido para buscar categorías por ID de forma eficiente O(1)
    const categoriaMap = new Map(categorias.map((cat) => [cat.id, cat]));

    // 3. Formateamos la respuesta final combinando los datos
    const reporteFinal = conteosAgrupados.map((grupo) => {
      const categoriaInfo = categoriaMap.get(grupo.id_categoria);
      return {
        // id_categoria: grupo.id_categoria,
        categoria_tipo: categoriaInfo?.tipo || 'DESCONOCIDO',
        categoria_sub_tipo: categoriaInfo?.sub_tipo || 'Sin Subcategoría',
        estado: grupo.estado,
        total_tickets: grupo._count._all,
      };
    });

    return reporteFinal;
  }
}
