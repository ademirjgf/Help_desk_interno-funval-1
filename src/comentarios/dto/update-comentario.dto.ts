import { PartialType } from '@nestjs/swagger';
import { CreateComentarioDto } from './create-comentario.dto.js';

export class UpdateComentarioDto extends PartialType(CreateComentarioDto) {}
