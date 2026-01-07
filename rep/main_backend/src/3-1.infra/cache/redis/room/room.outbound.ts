import { InsertDataToCache } from "@app/ports/cache/cache.outbound";
import { Inject, Injectable } from "@nestjs/common";
import { type RedisClientType } from "redis";
import { CACHE_ROOM_INFO_KEY_NAME, CACHE_ROOM_MEMBERS_KEY_PROPS_NAME, CACHE_ROOM_NAMESPACE_NAME, CACHE_ROOM_SOCKETS_KEY_PROPS_NAME, CACHE_ROOM_SUB_NAMESPACE_NAME, REDIS_SERVER } from "../../cache.constants";
import { RoomProps } from "@domain/room/vo";
import { InsertRoomDataDto } from "@app/room/commands/dto";


@Injectable()
export class InsertRoomDataToRedis extends InsertDataToCache<RedisClientType<any, any>> {

  constructor(
    @Inject(REDIS_SERVER) cache : RedisClientType<any, any>,
  ) { super(cache); };

  async insert(entity: Required<RoomProps>): Promise<boolean> {

    // room 관련 namespace 생성
    const roomNamespace : string = 
      `${CACHE_ROOM_NAMESPACE_NAME.CACHE_ROOM}:${entity.room_id}:${CACHE_ROOM_SUB_NAMESPACE_NAME.INFO}`.trim();

    // watch는 필요없을것 같다 왜냐 room_id가 랜덤이니까 
    const roomInfoKeyValue : Record<string, string> = {
      [CACHE_ROOM_INFO_KEY_NAME.CODE] : entity.code,
      [CACHE_ROOM_INFO_KEY_NAME.TITLE] : entity.title,
      [CACHE_ROOM_INFO_KEY_NAME.OWNER_ID] : entity.owner_user_id,
      [CACHE_ROOM_INFO_KEY_NAME.MAX_PARTICIANTS] : String(entity.max_participants),
      [CACHE_ROOM_INFO_KEY_NAME.CURRENT_PARTICIANTS] : "0",
    };

    if ( entity.password_hash ) roomInfoKeyValue[CACHE_ROOM_INFO_KEY_NAME.PASSWORD_HASH] = entity.password_hash
    
    await this.cache.hSet(roomNamespace, roomInfoKeyValue)

    return true;
  };
};

@Injectable()
export class InsertRoomDatasToRedis extends InsertDataToCache<RedisClientType<any, any>> {

  constructor(
    @Inject(REDIS_SERVER) cache : RedisClientType<any, any>,
  ) { super(cache); };

  async insert(entity: InsertRoomDataDto): Promise<boolean> {
    
    const cache = this.cache;

    // 정합성을 추가하고 싶다 이유는 만약 동시에 유저가 접근하면 인원수 올릴때 문제가 발생할 수 있기 때문이다. 
    const roomInfoNamespace : string = `${CACHE_ROOM_NAMESPACE_NAME.CACHE_ROOM}:${entity.room_id}:${CACHE_ROOM_SUB_NAMESPACE_NAME.INFO}`;
    const roomMemberNamespace : string = `${CACHE_ROOM_NAMESPACE_NAME.CACHE_ROOM}:${entity.room_id}:${CACHE_ROOM_SUB_NAMESPACE_NAME.MEMBERS}`;

    // 이건 굳이 필요없긴 하다.
    const roomSocketNamespace : string = `${CACHE_ROOM_NAMESPACE_NAME.CACHE_ROOM}:${CACHE_ROOM_SUB_NAMESPACE_NAME.SOCKETS}`;

    // 경합 때문에 재시도를 추가하면 좋긴 하다. ( 나중에는 lua를 적용해서 정합성 + 성능을 높이자. )
    for (  let att : number = 0; att < 5; att++) {
      await cache.watch([ roomInfoNamespace, roomMemberNamespace ]);

      try {
        const alreadyMember = await cache.hExists(roomMemberNamespace, entity.user_id); // 이미 유저가 존재할 경우 ( 인원을 늘리면 안된다. )
        
        const tx = cache.multi();

        // 인원이 존재한다면 스킵
        if ( alreadyMember ) {
          tx
          .hSet(roomMemberNamespace, entity.user_id, JSON.stringify({
            [CACHE_ROOM_MEMBERS_KEY_PROPS_NAME.IP] : entity.ip,
            [CACHE_ROOM_MEMBERS_KEY_PROPS_NAME.NICKNAME] : entity.nickname,
            [CACHE_ROOM_MEMBERS_KEY_PROPS_NAME.SOCKET_ID] : entity.socket_id
          })) // member에 추가 
          .hSet(roomSocketNamespace, entity.socket_id, JSON.stringify({
            [CACHE_ROOM_SOCKETS_KEY_PROPS_NAME.IP] : entity.ip,
            [CACHE_ROOM_SOCKETS_KEY_PROPS_NAME.ROOM_ID] : entity.room_id,
            [CACHE_ROOM_SOCKETS_KEY_PROPS_NAME.USER_ID] : entity.user_id
          }));

          const result = await tx.exec();
          if (result !== null) return true;
          continue;
        }

        const [currentStr, maxStr] = await cache.hmGet(
          roomInfoNamespace,
          [CACHE_ROOM_INFO_KEY_NAME.CURRENT_PARTICIANTS, CACHE_ROOM_INFO_KEY_NAME.MAX_PARTICIANTS] as any
        );

        // 일단 숫자로서 맞는지 확인
        const current = Number(currentStr ?? "0");
        const max = Number(maxStr ?? "0");
        if (!Number.isFinite(current) || !Number.isFinite(max) || max <= 0) {
          return false;
        };

        // 추가가 안되는 부분이다. 
        if (current >= max) {
          return false;
        };
        
        tx
          .hIncrBy(roomInfoNamespace, CACHE_ROOM_INFO_KEY_NAME.CURRENT_PARTICIANTS, 1)
          .hSet(roomMemberNamespace, entity.user_id, JSON.stringify({
            [CACHE_ROOM_MEMBERS_KEY_PROPS_NAME.IP]: entity.ip,
            [CACHE_ROOM_MEMBERS_KEY_PROPS_NAME.NICKNAME]: entity.nickname,
            [CACHE_ROOM_MEMBERS_KEY_PROPS_NAME.SOCKET_ID]: entity.socket_id,
          }))
          .hSet(roomSocketNamespace, entity.socket_id, JSON.stringify({
            [CACHE_ROOM_SOCKETS_KEY_PROPS_NAME.IP]: entity.ip,
            [CACHE_ROOM_SOCKETS_KEY_PROPS_NAME.ROOM_ID]: entity.room_id,
            [CACHE_ROOM_SOCKETS_KEY_PROPS_NAME.USER_ID]: entity.user_id,
          }));

        const result = await tx.exec();
        if (result !== null) return true;

      } finally {
        await cache.unwatch();
      };
    }

    return false;
  };
};