import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client.js';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();

    // Declaramos una variable tipo HttpException (la clase padre de todas las excepciones de NestJS)
    let nestException: HttpException;

    switch (exception.code) {
      case 'P2000':
        nestException = new BadRequestException(
          'Un valor proporcionado es demasiado largo para procesarlo.',
        );
        break;
      case 'P2001':
        nestException = new NotFoundException('Registro no encontrado.');
        break;
      case 'P2002':
        nestException = new ConflictException(
          'Ya existe un registro con ese valor email ó sub_tipo, que debe ser único. ',
        );
        break;
      case 'P2003':
        nestException = new BadRequestException(
          'Error de relación: El registro padre no existe o tiene dependencias.',
        );
        break;
      case 'P2004':
        nestException = new BadRequestException(
          'Los datos proporcionados no cumplen con las reglas del sistema.',
        );
        break;
      case 'P2014':
        nestException = new BadRequestException(
          'No se puede procesar tu operación porque romperia una relacion requerida por otra tabla.',
        );
        break;
      case 'P2020':
        nestException = new BadRequestException(
          'El valor ingresado esta fuera del rango.',
        );
        break;
      case 'P2025':
        nestException = new NotFoundException('Registro no encontrado.');
        break;
      case 'P2039':
        nestException = new BadRequestException(
          'El ID enviado supera el límite numérico permitido.',
        );
        break;
      default:
        console.error('Prisma Error No Mapeado:', exception);
        nestException = new InternalServerErrorException(
          'Error no controlado en la base de datos.',
        );
        break;
    }
    // Extraemos el estado físico y el cuerpo formateado nativamente por NestJS
    const status = nestException.getStatus();
    const errorResponse = nestException.getResponse();

    // Enviamos la respuesta usando la API de Express, pero con el formato nativo de NestJS
    response
      .status(status)
      .json(
        typeof errorResponse === 'string'
          ? { statusCode: status, message: errorResponse }
          : errorResponse,
      );
  }
}
