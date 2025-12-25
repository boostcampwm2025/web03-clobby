import { Injectable } from "@nestjs/common";
import { AfterCreateCardItemDataInfo, AfterUpdateCardItemDataInfo, UpdateCardItemAssetValueProps, UpdateCardItemInfoProps } from "../dto";
import { CardAggregate } from "@domain/card/card.aggregate";
import { Card, CardItemAsset } from "@domain/card/entities";
import { CardItemAssetProps } from "@domain/card/vo";
import { NotUpdateCardItemData } from "@error/domain/card/card.error";
import { SelectDataFromCache } from "@app/ports/cache/cache.inbound";
import { SelectDataFromDb } from "@app/ports/db/db.inbound";
import { InsertCardAssetDataProps } from "./uploading-card-item.usecase";
import { NotAllowCardItemMimeTypeValue, NotAllowUpdateCardItemDataToCacheOrDb, NotCreateCardItemData, NotFoundCardItemAssetKeyName } from "@error/application/card/card.error";
import { InsertDataToCache, UpdateDataToCache } from "@app/ports/cache/cache.outbound";
import { GetMultiPartVerGroupIdFromDisk, GetUploadUrlFromDisk } from "@app/ports/disk/disk.inbound";
import { UpdateValueToDb } from "@app/ports/db/db.outbound";


type UpdateCardItemDataUsecaseValues = {
  cardAssetNamespace : string; // card_asset을 찾기 위한 namespace
  itemIdKeyName : string; // item_id에 key이름 
  itemIdAttribute : string; // db에서 찾을 데이터 이름
};

type UpdateCardItemDataUsecaseProps<T, ET, DT> = {
  usecaseValues : UpdateCardItemDataUsecaseValues;
  selectCardAssetFromCache : SelectDataFromCache<T>;
  selectCardAssetFromDb : SelectDataFromDb<ET>;
  insertCardAssetToCache : InsertDataToCache<T>; 
  getUploadUrlFromDisk : GetUploadUrlFromDisk<DT>;
  getMultiVerGroupIdFromDisk : GetMultiPartVerGroupIdFromDisk<DT>;
  updateCardAssetToDb : UpdateValueToDb<ET>; // db에 데이터 수정하기 
  updateCardAssetToCache : UpdateDataToCache<T>; // cache에 데이터 수정하기
};

@Injectable()
export class UpdateCardItemDataUsecase<T, ET, DT> {

  private readonly usecaseValues : UpdateCardItemDataUsecaseProps<T, ET, DT>["usecaseValues"];
  private readonly selectCardAssetFromCache : UpdateCardItemDataUsecaseProps<T, ET, DT>["selectCardAssetFromCache"];
  private readonly selectCardAssetFromDb : UpdateCardItemDataUsecaseProps<T, ET, DT>["selectCardAssetFromDb"];
  private readonly insertCardAssetToCache : UpdateCardItemDataUsecaseProps<T, ET, DT>["insertCardAssetToCache"];
  private readonly getUploadUrlFromDisk : UpdateCardItemDataUsecaseProps<T, ET, DT>["getUploadUrlFromDisk"];
  private readonly getMultiVerGroupIdFromDisk : UpdateCardItemDataUsecaseProps<T, ET, DT>["getMultiVerGroupIdFromDisk"];
  private readonly updateCardAssetToDb : UpdateCardItemDataUsecaseProps<T, ET, DT>["updateCardAssetToDb"];
  private readonly updateCardAssetToCache : UpdateCardItemDataUsecaseProps<T, ET, DT>["updateCardAssetToCache"];

  constructor({
    usecaseValues, selectCardAssetFromCache, selectCardAssetFromDb, insertCardAssetToCache, getUploadUrlFromDisk, getMultiVerGroupIdFromDisk, updateCardAssetToDb, updateCardAssetToCache
  } : UpdateCardItemDataUsecaseProps<T, ET, DT>) {
    this.usecaseValues = usecaseValues;
    this.selectCardAssetFromCache = selectCardAssetFromCache;
    this.selectCardAssetFromDb = selectCardAssetFromDb;
    this.insertCardAssetToCache = insertCardAssetToCache;
    this.getUploadUrlFromDisk = getUploadUrlFromDisk;
    this.getMultiVerGroupIdFromDisk = getMultiVerGroupIdFromDisk;
    this.updateCardAssetToDb = updateCardAssetToDb;
    this.updateCardAssetToCache = updateCardAssetToCache;
  }

  async execute( dto : UpdateCardItemInfoProps ) : Promise<AfterUpdateCardItemDataInfo> {

    // 1. 정합성 체크
    const cardAggregate = new CardAggregate({ 
      card : new Card({ 
        card_id : dto.card_id,
        // 여기서 부터 더미데이터
        user_id : '018e9a48-3c8a-7b20-bc9d-9f5b8e9f88c0',
        category_id : 1,
        thumbnail_path : "thumbnail.png",
        status : "archived",
        title : "나의 취미는",
        workspace_height : 100,
        workspace_width : 100,
        background_color : "#ffcc00"
      }),
      // 정합성 검증을 위해서 여기에 추가 (여기를 검증하는 것이 주요 목표)
      cardItemAssets : [
        new CardItemAsset({
          item_id : dto.item_id,
          key_name : dto.path,
          mime_type : dto.mime_type,
          size : dto.size,
          card_id : dto.card_id,
          status : "uploading"
        })
      ]
    });
    const cardAsset : Required<CardItemAssetProps> | undefined = cardAggregate.getCardItemAssets().at(-1)?.getData();
    if ( !cardAsset ) throw new NotUpdateCardItemData();

    // 2. db, cache에서 해당하는 card_item_asset 데이터 찾기 
    let checkCardAsset : Required<CardItemAssetProps> | undefined;

    const namespace : string = `${this.usecaseValues.cardAssetNamespace}:${dto.card_id}:${dto.item_id}`.trim();
    checkCardAsset = await this.selectCardAssetFromCache.select({ 
      namespace,
      keyName : this.usecaseValues.itemIdKeyName
    });

    // cache에 없다면 db에서 찾기 + cache 저장
    if ( !checkCardAsset ) {
      checkCardAsset = await this.selectCardAssetFromDb.select({ attributeName : this.usecaseValues.itemIdAttribute, attributeValue : dto.item_id });
      if ( !checkCardAsset ) throw new NotFoundCardItemAssetKeyName();
      
      // asset 캐시 정보 저장
      const insertAsset : InsertCardAssetDataProps = {
        cardAsset : checkCardAsset, upload_id : undefined
      }
      await this.insertCardAssetToCache.insert(insertAsset);
    }

    // 추가로 기존의 type이 같은지 확인하는 로직 추가 -> mime_type을 활용해야 한다. 
    const originType : string | undefined = checkCardAsset.mime_type.split("/").at(0)?.trim(); // mime_type에 앞에만 
    if ( cardAsset.mime_type !== originType ) throw new NotAllowCardItemMimeTypeValue();

    // 3. 해당 item key_name에 해당하는 url 데이터 주기 -> 최대한 생성과 비슷하게 맞추어서 재활용 하기 
    try {
      // 10mb 이하
      if ( dto.size <= 10 * 1024 * 1024 ) {
        // 3-1. presigned_url 발급
        const upload_url : string = await this.getUploadUrlFromDisk.getUrl({ pathName : [
          checkCardAsset.card_id, 
          checkCardAsset.item_id, 
          cardAsset.key_name
        ], mime_type : cardAsset.mime_type });

        // 4. db, cache 데이터 업데이트
        const updateValue : UpdateCardItemAssetValueProps = {
          item_id : cardAsset.item_id,
          status : "uploading",
          size : cardAsset.size,
          key_name : cardAsset.key_name,
          mime_type : dto.mime_type,
          upload_id : undefined
        };
        const dbUpdated : boolean = await this.updateCardAssetToDb.update({ uniqueValue : cardAsset.item_id, updateColName : "", updateValue : updateValue }); // db 업데이트
        const cacheUpdated : boolean = await this.updateCardAssetToCache.updateKey({ namespace, keyName : this.usecaseValues.itemIdKeyName, updateValue }); // cache 업데이트
        if ( !dbUpdated || !cacheUpdated ) throw new NotAllowUpdateCardItemDataToCacheOrDb();

        // 5. item_id, presigned_url 반환
        const returnDto : AfterUpdateCardItemDataInfo = {
          item_id : checkCardAsset.item_id , mini : {upload_url}};
        return returnDto;
      } else {
        // 만약 같은 파일이라면?? 이부분에서 어떻게 추가를 할지 고민이다. -> 내생각에는 완료 목록도 같이 준다면 좋을 것 같다. 

        // 3. 업데이트 완료된 파일 목록을 준다. 

        // 4. 수정 없이 반환 -> 이미 uploading이기도 하고 모든게 그대로 이게 때문이다. -> 시간은 늘릴지 고민이다. 


        // 같은 파일이 아니면 새로운걸로 간주해서 변경하면 그만이다. 

        // 3. upload_id, part_size 
        const upload_id : string = await this.getMultiVerGroupIdFromDisk.getMultiId({ pathName : [
          checkCardAsset.card_id, 
          checkCardAsset.item_id, 
          cardAsset.key_name
        ], mime_type : cardAsset.mime_type });

        // 4. db, cache 데이터 업데이트 + upload_id
        const updateValue : UpdateCardItemAssetValueProps = {
          item_id : cardAsset.item_id,
          status : "uploading",
          size : cardAsset.size,
          key_name : cardAsset.key_name,
          mime_type : dto.mime_type,
          upload_id
        };
        const dbUpdated : boolean = await this.updateCardAssetToDb.update({ uniqueValue : cardAsset.item_id, updateColName : "", updateValue : updateValue }); // db 업데이트
        const cacheUpdated : boolean = await this.updateCardAssetToCache.updateKey({ namespace, keyName : this.usecaseValues.itemIdKeyName, updateValue }); // cache 업데이트
        if ( !dbUpdated || !cacheUpdated ) throw new NotAllowUpdateCardItemDataToCacheOrDb();

        // 5. item_id, upload_id, part_size 반환
        const returnDto : AfterUpdateCardItemDataInfo = {
          item_id : checkCardAsset.item_id, big : { upload_id, part_size : 10 * 1024 * 1024 }
        };
        return returnDto;
      }
    } catch (err) {
      throw new NotCreateCardItemData();
    };
  }

};