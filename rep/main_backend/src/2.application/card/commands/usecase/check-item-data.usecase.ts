import { Injectable } from "@nestjs/common";
import { CheckCardItemDataUrlProps } from "../dto";
import { SelectDataFromCache } from "@app/ports/cache/cache.inbound";
import { SelectDataFromDb } from "@app/ports/db/db.inbound";
import { NotAllowUpdateDataToCache, NotAllowUpdateDataToDb, NotAllowUploadDataToCheck, NotFoundCardItemAssetKeyName } from "@error/application/card/card.error";
import { CheckUploadDataFromDisk } from "@app/ports/disk/disk.inbound";
import { UpdateValueToDb } from "@app/ports/db/db.outbound";
import { UpdateDataToCache } from "@app/ports/cache/cache.outbound";


type CheckCarItemDataUsecaseValues = {
  cardAssetNamespace : string;
  itemIdKeyName : string;
  itemIdAttribute : string;  
  statusKeyName : string;
};

type CheckCardItemDataUsecaseProps<T, ET, DT> = {
  usecaseValues : CheckCarItemDataUsecaseValues;
  selectCardAssetFromCache : SelectDataFromCache<T>; // cache 
  selectCardAssetFromDb : SelectDataFromDb<ET>;  // db
  checkUploadFromDisk : CheckUploadDataFromDisk<DT>;
  updateCardAssetToDb : UpdateValueToDb<ET>; // db upadate
  updateCardAssetToCache : UpdateDataToCache<T>; // cache update
};

@Injectable()
export class CheckCardItemDataUsecase<T, ET, DT> {

  private readonly usecaseValues : CheckCardItemDataUsecaseProps<T, ET, DT>["usecaseValues"];
  private readonly selectCardAssetFromCache : CheckCardItemDataUsecaseProps<T, ET, DT>["selectCardAssetFromCache"];
  private readonly selectCardAssetFromDb : CheckCardItemDataUsecaseProps<T, ET, DT>["selectCardAssetFromDb"];
  private readonly checkUploadFromDisk : CheckCardItemDataUsecaseProps<T, ET, DT>["checkUploadFromDisk"];
  private readonly updateCardAssetToDb : CheckCardItemDataUsecaseProps<T, ET, DT>["updateCardAssetToDb"];
  private readonly updateCardAssetToCache : CheckCardItemDataUsecaseProps<T, ET, DT>["updateCardAssetToCache"];

  constructor({ 
    usecaseValues, selectCardAssetFromCache, selectCardAssetFromDb, checkUploadFromDisk, updateCardAssetToDb, updateCardAssetToCache
  } : CheckCardItemDataUsecaseProps<T, ET, DT>) {
    this.usecaseValues = usecaseValues;
    this.selectCardAssetFromCache = selectCardAssetFromCache;
    this.selectCardAssetFromDb = selectCardAssetFromDb;
    this.checkUploadFromDisk = checkUploadFromDisk;
    this.updateCardAssetToDb = updateCardAssetToDb;
    this.updateCardAssetToCache = updateCardAssetToCache;
  }

  async execute( dto : CheckCardItemDataUrlProps ) : Promise<void> {

    // 1. key_name 찾기 (cache -> db)
    let filePath : string | undefined;
    const namespace : string = `${this.usecaseValues.cardAssetNamespace}:${dto.card_id}:${dto.item_id}`.trim();
    filePath = await this.selectCardAssetFromCache.select({ 
      namespace,
      keyName : this.usecaseValues.itemIdKeyName
    });
    if ( !filePath ) {
      filePath = await this.selectCardAssetFromDb.select({ attributeName : this.usecaseValues.itemIdAttribute, attributeValue : dto.item_id });
      // cache에 asset 정보 저장

      if (!filePath) throw new NotFoundCardItemAssetKeyName();
    }

    // 2. 검증 
    const checked : boolean = await this.checkUploadFromDisk.check({ pathName : filePath, etag : dto.etag });
    if ( !checked ) throw new NotAllowUploadDataToCheck(undefined);

    // 3. 변경 ( db, cache )
    const updateChecked : boolean = await this.updateCardAssetToDb.update({ uniqueValue : dto.item_id, updateValue : undefined }); // 상태를 변경해주면 되기 때문에
    if ( !updateChecked ) throw new NotAllowUpdateDataToDb();

    const updateCacheChecked : boolean = await this.updateCardAssetToCache.updateKey({ namespace, keyName : this.usecaseValues.statusKeyName, updateValue : undefined }); // 마찬가지 상태를 변경해주면 된다. 
    if ( !updateCacheChecked ) throw new NotAllowUpdateDataToCache();

    return;
  };

};