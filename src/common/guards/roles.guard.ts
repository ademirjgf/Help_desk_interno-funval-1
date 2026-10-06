import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.rol) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a este recurso.',
      );
    }
    const tieneRolPermitido = requiredRoles.includes(user.rol);
    if (!tieneRolPermitido) {
      throw new ForbiddenException(
        `Tu rol (${user.rol}) no tiene autorización para esta ruta.`,
      );
    }
    return true;
  }
}
