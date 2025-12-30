import { UpdateDataToCache } from "@app/ports/cache/cache.outbound";
import { UpdateValueToDb } from "@app/ports/db/db.outbound";
import { Injectable } from "@nestjs/common";
import { UpdateCardInputDto } from "../dto";


type UpdateCardUsecaseValues = {
  cardNamespace : string;
};

type UpdateCardUsecaseProps<T, CT> = {
  usecaseValues : UpdateCardUsecaseValues;
  updateCardToDb : UpdateValueToDb<T>;
  updateCardToCache : UpdateDataToCache<CT>;
};

@Injectable()
export class UpdateCardUsecase<T, CT> {

  private readonly usecaseValues : UpdateCardUsecaseProps<T, CT>["usecaseValues"];
  private readonly updateCardToDb : UpdateCardUsecaseProps<T, CT>["updateCardToDb"];
  private readonly updateCardToCache : UpdateCardUsecaseProps<T, CT>["updateCardToCache"];

  constructor({
    usecaseValues, updateCardToDb, updateCardToCache
  } : UpdateCardUsecaseProps<T, CT>) {
    this.usecaseValues = usecaseValues;
    this.updateCardToDb = updateCardToDb;
    this.updateCardToCache = updateCardToCache;
  }

  async execute(dto : UpdateCardInputDto) : Promise<void> {

    // 1. db에 있는 데이터를 수정한다. -> card_id에 해당하는 dto에 값을 수정해야 한다. 
    await this.updateCardToDb.update({
      uniqueValue : dto.card_id,
      updateColName : "",
      updateValue : dto
    });
    
    // 2. cache에 있는 데이터를 수정한다. -> 하나만 바꾸는게 아니라 전체 변경
    const namespace : string = `${this.usecaseValues.cardNamespace}:${dto.card_id}`.trim();
    await this.updateCardToCache.updateKey({
      namespace, keyName : "", updateValue : dto
    });
  }

};