import {
  Controller,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
  Request,
  Body,
  Get,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import type { Request as RequestExpress } from 'express';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import { AuthService } from './auth.service.js';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto.js';
import { Public } from '../common/decorators/public.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Autentica a un Usuario registrado y genera un token de acceso.',
  })
  @Post('login')
  async login(
    @Body() loginAuthDto: LoginAuthDto,
    @Request() req: RequestExpress,
  ) {
    return this.authService.login(req.user);
  }

  @ApiOperation({
    summary: 'Muestra los datos del perfil del usuario autenticado.',
  })
  @Get('profile')
  async profile(@Request() req: RequestExpress) {
    return req.user;
  }

  // @Roles('ADMIN')
  @Public()
  @ApiOperation({ summary: 'Registra a un nuevo Usuario.' })
  @Post('register')
  async register(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.authService.register(createUsuarioDto);
  }
}
