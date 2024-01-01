// app.gateway.ts

import { Inject, forwardRef } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from './modules/auth/auth.service';
import { UsersService } from './modules/users/users.service';
import { JwtPayloadType } from './modules/auth/strategies/types/jwt-payload.type';
import { UsersGateway } from './modules/users/users.gateway'; // Adjust the path accordingly
import { connectionStatusEnum } from './modules/users/schemas/users.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private userService: UsersService,
    @Inject(forwardRef(() => UsersGateway))
    private usersGateway: UsersGateway,
  ) {}

  @WebSocketServer()
  server;

  connectedUsers: Map<string, JwtPayloadType> = new Map();

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    const payload = await this.authService.verifyAccessToken(token);
    const user =
      payload &&
      (await this.userService.update(payload.id, {
        connectionStatus: connectionStatusEnum.online,
        lastSeenAt: null,
      }));
    if (!user) {
      client.disconnect(true);
      return;
    }

    this.connectedUsers.set(client.id, payload);

    this.usersGateway.notifyAdminUsersAboutConnection({
      id: payload.id,
      status: connectionStatusEnum.online,
      lastSeenAt: null,
    });
  }

  async handleDisconnect(client) {
    const user = this.connectedUsers.get(client.id);
    if (!user) return;
    this.connectedUsers.delete(client.id);

    this.usersGateway.notifyAdminUsersAboutConnection({
      id: user.id,
      status: connectionStatusEnum.offline,
      lastSeenAt: String(new Date()),
    });

    await this.userService.update(user.id, {
      connectionStatus: connectionStatusEnum.offline,
      lastSeenAt: new Date(),
    });
  }
}
