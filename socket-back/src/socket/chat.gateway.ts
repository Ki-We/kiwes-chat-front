import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    credentials: true,
    origin: ['http://localhost:3000'],
  },
})
export class ChatGateway {
  private logger = new Logger('Gateway');

  @WebSocketServer() server: Server;

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`${client.id} 소켓 연결`);
  }

  handleDisconnect(client: Socket) {
    console.log(client.id + ' server socket disconnected');
  }

  // 채팅방 생성
  @SubscribeMessage('join')
  enterChatRoom(client: Socket, payload) {
    const roomname = payload.room.name;
    client.join(roomname);
    this.server.to(roomname).emit('info', payload.user);
  }

  // 채팅방 안에 사람에게 메시지 보내기
  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload): void {
    console.log(payload);
    console.log(client);
  }
}
