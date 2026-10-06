import { Injectable } from '@nestjs/common';
import { UsuarioService } from '../usuario/usuario.service.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto.js';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}
  async validateUsuario(loginAuthDto: LoginAuthDto) {
    const user = await this.usuarioService.findEmail(loginAuthDto.email);
    if (user && (await bcrypt.compare(loginAuthDto.password, user.password))) {
      const { password, ...restoUser } = user;
      return restoUser;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
    };
    return { access_token: this.jwtService.sign(payload) };
  }

  async register(createUsuarioDto: CreateUsuarioDto) {
    return await this.usuarioService.create(createUsuarioDto);
  }
}
