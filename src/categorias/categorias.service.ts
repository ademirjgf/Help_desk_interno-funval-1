import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.categoria.findMany({
      orderBy: [{ tipo: 'asc' }, { sub_tipo: 'asc' }],
    });
  }

  async findOne(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      throw new NotFoundException(`No existe la categoría con id ${id}.`);
    }

    return categoria;
  }

  async create(dto: CreateCategoriaDto) {
    const subTipo = dto.sub_tipo.trim();

    const existente = await this.prisma.categoria.findUnique({
      where: { sub_tipo: subTipo },
    });

    if (existente) {
      throw new ConflictException('Ya existe una categoría con ese subtipo.');
    }

    return this.prisma.categoria.create({
      data: {
        tipo: dto.tipo,
        sub_tipo: subTipo,
      },
    });
  }

  async update(id: number, dto: UpdateCategoriaDto) {
    await this.findOne(id);

    const subTipo = dto.sub_tipo?.trim();

    if (subTipo) {
      const existente = await this.prisma.categoria.findUnique({
        where: { sub_tipo: subTipo },
      });

      if (existente && existente.id !== id) {
        throw new ConflictException('Ya existe una categoría con ese subtipo.');
      }
    }

    return this.prisma.categoria.update({
      where: { id },
      data: {
        ...(dto.tipo !== undefined && { tipo: dto.tipo }),
        ...(subTipo !== undefined && { sub_tipo: subTipo }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const tareasRelacionadas = await this.prisma.tarea.count({
      where: { id_categoria: id },
    });

    if (tareasRelacionadas > 0) {
      throw new ConflictException(
        'No se puede eliminar la categoría porque tiene tareas relacionadas.',
      );
    }

    return this.prisma.categoria.delete({
      where: { id },
    });
  }
}
