import { Injectable } from '@nestjs/common';
import { DEFAULT_IDX, YjsRepository, YjsRoomEntry } from './yjs-repo';
import * as Y from 'yjs';

// 두 repo는 현재 동일하다 
@Injectable()
export class CodeeditorRepository implements YjsRepository {
  private readonly roomDocs = new Map<string, YjsRoomEntry>();

  // yjs room 정보 가져오기 
  get(room_id: string): YjsRoomEntry | undefined {
    return this.roomDocs.get(room_id);
  };

  // 방 정보가 없으면 새로 생성 ( 일단 캐시를 추가하면 이 루트도 일단 정리될 예정이다. )
  ensure(roomId: string): YjsRoomEntry {
    let entry = this.roomDocs.get(roomId);
    if (!entry) {
      entry = { doc: new Y.Doc(), idx: DEFAULT_IDX };
      this.roomDocs.set(roomId, entry);
    }
    return entry;
  };

  // 일단 caching이 나오면 의미가 있어질 예정입니다 일단은 스킵
  set(room_id: string, entry : YjsRoomEntry): void {
    this.roomDocs.set(room_id, entry);
  };

  // 새로운 idx를 적용 ( 안정성을 위해서 ensure을 했다만  )
  setIdx(roomId: string, idx: string): void {
    const entry = this.ensure(roomId); // 문제는 없을거다 아마 
    entry.idx = idx;
  }

  delete(room_id: string): void {
    this.roomDocs.delete(room_id);
  }
}
