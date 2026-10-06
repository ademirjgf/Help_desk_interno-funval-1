import { Module } from '@nestjs/common';
import { ComentariosService } from './comentarios.service.js';
import { ComentariosController } from './comentarios.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ComentariosController],
  providers: [ComentariosService],
  exports: [ComentariosService],
})
export class ComentariosModule {}
