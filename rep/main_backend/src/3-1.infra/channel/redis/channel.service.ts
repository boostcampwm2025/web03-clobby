import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import {  type RedisClientType } from "redis";
import { REDIS_CHANNEL_PUB, REDIS_CHANNEL_SUB, SsePayload } from "../channel.constants";
import { filter, map, Observable, share, Subject } from "rxjs";


// sse와 관련된 service 
@Injectable()
export class RedisSseBrokerService implements OnModuleDestroy {

  // observable로 가져오고 next로 밀어넣을 수 있다.  
  private readonly subject = new Subject<{ channel : string, payload : SsePayload }>();

  // 모두가 같은 방에서는 같은 값을 공유하도록 한다.
  private readonly events$ = this.subject.asObservable().pipe(share()); // 추후 확장을 위해 pipe로 묶는다. 

  // 사용하는 유저가 있을때만 방이 유지되도록 하려고 한다. 
  private readonly channelCount = new Map<string, number>(); // channel : 인원

  constructor(
    @Inject(REDIS_CHANNEL_PUB) private readonly pub : RedisClientType,
    @Inject(REDIS_CHANNEL_SUB) private readonly sub : RedisClientType
  ) {}

  // 구독을 했을때 발생하는 시나리오 
  async subscribe(channel : string) : Promise<void> {

    // 해당 방이 있는지 아니면 없는지 조사하는 로직 
    const count : number = this.channelCount.get(channel) ?? 0; // undefiend, null이면 0
    this.channelCount.set(channel, count + 1); // 해당 값에 +1을 다시 세팅한다.

    if ( count > 0 ) return;

    await this.sub.subscribe(channel, (message) => {
      try {
        // message를 검사하는 타입도 존제하면 좋을것 같다. 

        //1. subscribe에 해당 channel에서 받은 message를 밀어 넣는다. 
        this.subject.next({
          channel,
          payload : JSON.parse(message)
        });
      } catch (err) {
        // 나중에 logger로 확인해야 할 것 같다.
        console.error("[reids subscribe error]", err);
      }
    });
  };

  // 채널 삭제 검사
  async release( channel : string ) : Promise<void> {
    const count : number | undefined = this.channelCount.get(channel);
    if ( !count ) return;

    // 마지막 유저가 나가는 거라면 해당 채널을 삭제하고 정리한다.
    if ( count === 1 ) {
      this.channelCount.delete(channel);
      await this.sub.unsubscribe(channel);
      return;
    }

    // 그게 아니라면 유저 수만 감소한다. 
    this.channelCount.set(channel, count - 1);
  }

  // 구독 채널에 전송
  async publish(channel : string, payload : SsePayload) {
    await this.pub.publish(channel, JSON.stringify(payload));
  };

  // 해당 subject를 받을 수 있다. 
  onChannel(channel : string) : Observable<SsePayload> {
    return this.events$.pipe(
      filter((e) => e.channel === channel),
      map((e) => e.payload)
    );
  };

  // module이 없어지면 모든 구독을 해제해야 한다.
  async onModuleDestroy() {

    const channels : Array<string> = Array.from(this.channelCount.keys()); // 모든 채널 이름

    await Promise.allSettled(channels.map((ch) => this.sub.unsubscribe(ch))); // 구독 취소

    this.channelCount.clear(); // 모든 데이터 정리

    this.subject.complete(); // 모든 스트림을 종료
  }

};

// 나중에 websocket과 관련된 서비스도 있을 수 있다. 