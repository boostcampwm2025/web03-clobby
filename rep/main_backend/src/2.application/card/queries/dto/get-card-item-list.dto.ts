

type CardItemStatus = "ALL" | "RENDER" | "DEL";

// 처음 시작 할때 쓰이는 dto
export type GetCardItemListsDto = {
  card_id : string;
  status : CardItemStatus;
  item_ids : Array<string>;
};

// 반환할때 사용하는 dto 
export type ReturnCardItemListDataProps = {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number | undefined;
  rotation: number;
  scale_x: number;
  scale_y: number;
  opacity: number | undefined;
  z_index: number | undefined;
  is_locked: boolean | undefined;
  is_visible: boolean | undefined;
  name: string | undefined;
  option: Record<string, any>;
};

export type ReturenCardItemAssetDtaProps = {
  upload_url: string;
  status:  'uploading' | 'ready' | 'failed';
};  

// 반환할떄 사용하는 거
export type ReturnCardItemListsDto = {
  item_id : string;
  
  // 기본적인 정보
  datas : ReturnCardItemListDataProps | undefined;

  // 파일 정보
  assets : ReturenCardItemAssetDtaProps | undefined;
};

// 실제로는 이게 쓰일 예정이다.
export type ReturnCardDataDto = {
  card_id : string;
  status : CardItemStatus;
  lists : Array<ReturnCardItemListsDto>;
};