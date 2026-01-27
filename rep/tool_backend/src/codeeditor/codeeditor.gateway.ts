import { AuthType, ToolBackendPayload } from '@/guards/guard.type';
import { Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CODEEDITOR_CLIENT_EVENT_NAME, CODEEDITOR_EVENT_NAME } from './codeeditor.constants';
import { CodeeditorService } from './codeeditor.service';
import { KafkaService } from '@/infra/event-stream/kafka/event-stream.service';
import { EVENT_STREAM_NAME } from '@/infra/event-stream/event-stream.constants';
import { CODEEDITOR_WEBSOCKET } from '@/infra/websocket/websocket.constants';
import { CodeeditorWebsocket } from '@/infra/websocket/codeeditor/codeeditor.service';
import * as Y from 'yjs';
import { CodeeditorRepository } from '@/infra/memory/tool';


@WebSocketGateway({
  namespace: process.env.NODE_BACKEND_WEBSOCKET_CODEEDITOR,
  path: process.env.NODE_BACKEND_WEBSOCKET_PREFIX,
  cors: {
    origin: process.env.NODE_ALLOWED_ORIGIN?.split(',').map((origin) => origin.trim()),
    credentials: process.env.NODE_ALLOWED_CREDENTIALS === 'true',
  },
  transports: ['websocket'],
  pingTimeout: 20 * 1000, // ping pong 허용 시간 ( 20초 )
})
export class CodeeditorWebsocketGateway implements OnGatewayInit, OnGatewayConnection {

  @WebSocketServer()
  private readonly server: Server;

  private readonly logger = new Logger();

  constructor(
    private readonly codeeditorService: CodeeditorService,
    private readonly kafkaService: KafkaService,
    private readonly codeeditorRepo : CodeeditorRepository,
    @Inject(CODEEDITOR_WEBSOCKET) private readonly codeeditorSocket: CodeeditorWebsocket,
  ) {}

  // 연결을 했을때
  afterInit(server: Server): void {
    this.codeeditorSocket.bindServer(server);

    server.use(async (socket, next) => {
      try {
        const { token, type } = socket.handshake.auth as AuthType;

        if (!token) return next(new Error('TOKEN_REQUIRED'));
        if (type !== 'main' && type !== 'sub') return next(new Error('INVALID_TYPE'));

        const payload = await this.codeeditorService.guardService(token, type);

        // data 추가
        socket.data.payload = payload;
        this.logger.log('웹소켓 준비되었습니다.');
        return next();
      } catch (err) {
        this.logger.error(err);
        next(new Error('인증 에러'));
      }
    });
  }

  // 연결 완료 후
  async handleConnection(client: Socket) {
    const payload: ToolBackendPayload = client.data.payload;
    if (!payload) {
      client.disconnect(true);
      return;
    }
    const roomName = this.codeeditorService.makeNamespace(payload.room_id); // 방가입
    await client.join(roomName);
    client.data.roomName = roomName;
    
    // 메모리에 존재하면 가져오고 없으면 cache에서 가져온다.  
    const entry = this.codeeditorRepo.ensure(roomName); // 일단 실험을 위해서 메모리로만 진행을 해보자

    // 그 업데이트 본을 준다. 
    const fullUpdate = Y.encodeStateAsUpdate(entry.doc);
    client.emit('yjs-init', fullUpdate); // 클라이언트에게 yjs 초기 문서를 전달해준다. 

    if (payload.clientType === 'main') {
      // main이 불러오면 ydoc에 있는 캐시도 자동으로 불러오게 한다. 

      this.kafkaService.emit(EVENT_STREAM_NAME.CODEEDITOR_ENTER, {
        room_id: payload.room_id,
        user_id: payload.user_id,
        tool: payload.tool,
        socket_id: payload.socket_id,
        ticket: payload.ticket,
        at: Date.now(), // 현재 보낸 시간
      });
    }

    client.emit(CODEEDITOR_CLIENT_EVENT_NAME.PERMISSION, { ok: true });
  }

  async handleDisconnect(client: Socket) {
    const roomName = client.data.roomName;
    if (!roomName) return;

    // TODO: 방에 아무도 없을 때 삭제

  }

  @SubscribeMessage(CODEEDITOR_EVENT_NAME.HEALTH_CHECK)
  healthCheck(
    //
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const payload: ToolBackendPayload = client.data.payload;
      this.logger.log('health체크중: ', payload);

      return { ok: true };
    } catch (err) {
      this.logger.error(err);
      throw new WsException({ message: err.message ?? '에러 발생', status: err.status ?? 500 });
    }
  }

  // 클라이언트가 서버에게 업데이트 완료했다고 보내는 메시지
  // 클라이언트가 초기값을 받고 그 동안에 이루어진 작업을 요청하는 것이다. 
  @SubscribeMessage('yjs-init-ack')
  handleYjsInitAck(
    
  ) {

  };

  // 업데이트 하고 싶다고 보내는 메시지
  @SubscribeMessage('yjs-update')
  handleYjsUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() update: Buffer, // Yjs 데이터는 바이너리
  ) {
    try {
      if (!update) return;

      // 캐싱된 룸 이름 사용
      const roomName = client.data.roomName;

      const entry = this.codeeditorRepo.get(roomName);
      if (!entry) return;

      // 여기서 메모리 업데이트 + cache 업데이트를 진행해야 한다. 
      Y.applyUpdate(entry.doc, new Uint8Array(update));

      // 브로드캐스트 (이게 나를 제외하고 전부 보내는것인지 궁금)
      // code에 경우 최신성 보다는 정확성이 더 중요하다고 생각하기 때문에 이 부분에서 volatile을 삭제한다. 
      client.to(roomName).emit('yjs-update', update);
    } catch (error) {
      this.logger.error(`Yjs Update Error: ${error.message}`);
    }
  };
  

  // 이 부분은 잠시 비활성화 할 예정입니다.
  // @SubscribeMessage('request-sync')
  // handleRequestSync(@ConnectedSocket() client: Socket) {
  //   const roomName = client.data.roomName;
  //   let doc = this.codeeditorRepo.get(roomName);

  //   if (!doc) {
  //     doc = new Y.Doc();
  //     this.codeeditorRepo.set(roomName, doc);
  //   };

  //   const fullUpdate = Y.encodeStateAsUpdate(doc);
  //   client.emit('yjs-update', fullUpdate);

  //   this.logger.log('doc length', doc?.getText('monaco').length);
  // }

  @SubscribeMessage('awareness-update')
  handleAwarenessUpdate(@ConnectedSocket() client: Socket, @MessageBody() update: Buffer) {
    try {
      if (!update) return;

      client.to(client.data.roomName).volatile.emit('awareness-update', update);
    } catch (error) {
      this.logger.error(`Awareness Update Error: ${error.message}`);
    }
  }
}
