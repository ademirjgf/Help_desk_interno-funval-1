import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TareasController } from './tareas.controller.js';
import { TareasService } from './tareas.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [TareasController],
  providers: [TareasService],
  exports: [TareasService],
})
export class TareasModule {}
