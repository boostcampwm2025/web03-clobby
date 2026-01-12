import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { RedisIoAdapter } from '@infra/channel/redis/channel.service';

async function bootstrap() {
  // 기본 설정
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // 웹소켓 adapter 설정
  const redisAdapter = new RedisIoAdapter(app, config);
  await redisAdapter.websocketConnectToRedis(); // websocket을 redis로 연결
  app.useWebSocketAdapter(redisAdapter);

  // cors 설정
  const origin : Array<string> = config
  .get<string>("NODE_ALLOWED_ORIGIN", "http://localhost:3000")
  .split(",")
  .map((host : string) => host.trim());

  const methods : Array<string> = config
  .get<string>("NODE_ALLOWED_METHODS" ,"GET,POST")
  .split(",")
  .map((method : string) => method.trim());

  const allowedHeaders : Array<string> = config
  .get<string>("NODE_ALLOWED_HEADERS", "Content-Type, Accept, Authorization")
  .split(",")
  .map((header : string) => header.trim());

  const credentials : boolean = config
  .get<string>("NODE_ALLOWED_CREDENTIALS", "false").trim() === "true"

  const exposedHeaders : Array<string> = config
  .get<string>("NODE_ALLOWED_EXPOSE_HEADERS", "")
  .split(",")
  .map((header : string) => header.trim());

  app.enableCors({
    origin, methods, allowedHeaders, credentials, exposedHeaders
  });

  // port, host 설정
  const port: number = config.get<number>('NODE_PORT', 8080);
  const host: string = config.get<string>('NODE_HOST', 'localhost');

  // 종료 훅을 반드시 호출해 달라는 함수이다.
  app.enableShutdownHooks();

  // app에 들어오는 global prefix는 
  const prefix : string = config.get<string>("NODE_BACKEND_PREFIX", "api");
  app.setGlobalPrefix(prefix);

  await app.listen(port, host);
}
bootstrap();
