import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { RoleEnum } from './schemas/users.schema';

@WebSocketGateway({
  namespace: ['users'],
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private authService: AuthService) {}

  @WebSocketServer()
  server;
  connectedAdmins: Map<string, JwtPayloadType> = new Map();

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    const payload = await this.authService.verifyAccessToken(token);

    if (!payload || !payload.roles.includes(RoleEnum.Admin)) {
      client.disconnect(true);
      return;
    }
    this.connectedAdmins.set(client.id, payload);
  }

  async handleDisconnect(client) {
    const user = this.connectedAdmins.get(client.id);
    if (!user) return;
    this.connectedAdmins.delete(client.id);
  }
  notifyAdminUsersAboutConnection(user) {
    this.connectedAdmins.forEach((admin, key) => {
      this.server.to(key).emit('userConnected', user);
    });
  }
}
