import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Public } from '../common/decorators/public.decorator.js';

@Public()
@WebSocketGateway({
  namespace: '/notificaciones',
  cors: {
    origin: '*',
  },
})
export class NotificacionesGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('registrarUsuario')
  registrarUsuario(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { idUsuario: number },
  ) {
    void client.join(`usuario:${data.idUsuario}`);

    client.emit('usuarioRegistrado', {
      idUsuario: data.idUsuario,
    });
  }

  emitirAUsuario(
    idUsuario: number,
    notificacion: unknown,
  ) {
    this.server
      .to(`usuario:${idUsuario}`)
      .emit('nuevaNotificacion', notificacion);
  }
}