import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TareasController } from './tareas.controller.js';
import { TareasService } from './tareas.service.js';
import { ComentariosModule } from '../comentarios/comentarios.module.js';

@Module({
  imports: [PrismaModule, ComentariosModule],
  controllers: [TareasController],
  providers: [TareasService],
  exports: [TareasService],
})
export class TareasModule {}
