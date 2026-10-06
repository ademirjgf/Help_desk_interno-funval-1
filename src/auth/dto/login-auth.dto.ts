import { PickType } from '@nestjs/swagger';
import { CreateUsuarioDto } from '../../usuario/dto/create-usuario.dto.js';

export class LoginAuthDto extends PickType(CreateUsuarioDto, [
  'email',
  'password',
]) {}
