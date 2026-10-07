import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import bcrypt from 'bcryptjs';
import { QueryUsuarioDto } from './dto/query-usuario.dto.js';

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const { password, ...restoDataUsuario } = createUsuarioDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    return await this.prisma.usuario.create({
      data: { password: hashedPassword, ...restoDataUsuario },
      omit: { password: true },
    });
  }

  async findAll(query: QueryUsuarioDto) {
    const { rol } = query;
    return await this.prisma.usuario.findMany({
      where: { ...(rol && { rol }) },
      orderBy: { id: 'asc' },
      omit: { password: true },
    });
  }

  async findOne(id: number) {
    return await this.prisma.usuario.findMany({
      where: { id },
      omit: { password: true },
    });
  }

  async findEmail(email: string) {
    return await this.prisma.usuario.findUnique({ where: { email } });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return await this.prisma.usuario.update({
      where: { id },
      data: updateUsuarioDto,
      omit: { password: true },
    });
  }

  async remove(id: number) {
    return await this.prisma.usuario.delete({
      where: { id },
      omit: { password: true },
    });
  }
}
