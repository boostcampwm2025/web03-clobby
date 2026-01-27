import * as Y from 'yjs';

// yjs에서 저장할 map 모양
export type YjsRoomEntry = {
  doc : Y.Doc;
  idx : string;
};

// 다른 곳에서 실수 하지 않게 틀을 작성
export interface YjsRepository {
  // room_id에 따른 yhs 입력
  get(room_id: string): YjsRoomEntry | undefined;

  // 방이 없으면 생성 ( 실수 방지 )
  ensure(roomId: string): YjsRoomEntry;

  // entry 덮어 쓰기 
  set(room_id: string, entry: YjsRoomEntry): void;
  
  // room에 idx만 변경
  setIdx(room_id : string, idx : string) : void;

  // 삭제
  delete(room_id: string): void;
}

export const DEFAULT_IDX = '0-0';