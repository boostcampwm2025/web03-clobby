import { MediasoupService } from "@infra/media/mediasoup/media";
import { Injectable, Logger } from "@nestjs/common";
import { RoomEntry } from "./sfu.validate";
import { SfuError } from "@error/presentation/sfu/sfu.error";
import { mediaSoupRouterConfig } from "@infra/media/mediasoup/config";


@Injectable()
export class SfuService {

  // sfu 서버가 관리하는 로직 ( 메모리 낭비가 있는데 어떻게 하면 좀 효율적으로 저장이 가능할까? )
  private readonly logger = new Logger(SfuService.name);
  
  // wokre들과 router 정리
  private readonly roomRouters = new Map<string, RoomEntry>(); // room_id : RoomEntry
  private readonly createRoomRoutings = new Map<string, Promise<RoomEntry>>(); // room_id : Promise<RoomEntry> -> 생성하고 있는 중인 룸


  constructor(
    private readonly mediaSoupService : MediasoupService,
  ) {}

  private async createRoomRouting(room_id : string) : Promise<RoomEntry> {
    try {
      const { worker, workerIdx } = this.mediaSoupService.picWorker(); 

      // 여기서 허용 가능한 router에 config를 부여할 수 있다. 
      const router = await worker.createRouter(
        mediaSoupRouterConfig
      ); 

      // 기본 설정
      const roomEntry : RoomEntry = {
        worker_idx : workerIdx,
        room_id,
        router,
        worker_pid : worker.pid,
        created_at : new Date()
      };

      // 메모리에 저장
      this.roomRouters.set(room_id, roomEntry);

      // router가 만약 내려간다면? ( 근데 worker가 내려가면 애초에 그 방은 내려가니까 worker에 죽음은 그 프로세스 전체에 삭제 )
      router.observer.on("close", () => {
        const closedRouterEntry = this.roomRouters.get(room_id);
        if ( closedRouterEntry?.router === router ) {
          // 방이랑 worker_id 기록한거 삭제
          this.roomRouters.delete(room_id);
        };
      });

      // 여기에서 대표 producer transport도 나중에 등록 예정

      return roomEntry;
    } catch (err) {
      this.logger.error(err); // error가 발생한다면 
      throw new SfuError(err);
    } finally {
      this.createRoomRoutings.delete(room_id);
    };
  };

  // 1. router 생성 관련 함수 -> 생성 혹은 얻는 이유는 방을 만들었다고 무조건 router를 부여하면 비어있는 방에 낭비가 심할 수 있기에 들어와야 활성화가 된다. 
  async getOrCreateRoomRouter(room_id : string) : Promise<RoomEntry> {
    
    // 이미 생성된 router라면
    const roomRouterExist = this.roomRouters.get(room_id); 
    if ( roomRouterExist && !roomRouterExist.router.closed ) {
      return roomRouterExist;
    };

    // 생성 중이라면 
    const createRoomRoutingExist = this.createRoomRoutings.get(room_id);
    if ( createRoomRoutingExist ) {
      return createRoomRoutingExist;
    };

    // 아무것도 없다면 새롭게 생성할 수 있다.
    const roomEntry = this.createRoomRouting(room_id);
    this.createRoomRoutings.set(room_id, roomEntry);

    return roomEntry;
  };

};