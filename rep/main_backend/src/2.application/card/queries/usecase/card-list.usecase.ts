// 실시간 카드 리스트 생성과 관련해서 가져오기 
import { SelectDataFromDb } from "@app/ports/db/db.inbound";
import { Injectable } from "@nestjs/common";
import { CardListDataProps } from "../dto";


type GetCardListUsecaseProps<T> = {
  selectCardDataFromDb : SelectDataFromDb<T>; // 나중에 infra만 바꿀수 있고 이를 수정할 수도 있을것 같다. 
};

@Injectable()
export class GetCardListUsecase<T> {

  private readonly selectCardDataFromDb : GetCardListUsecaseProps<T>["selectCardDataFromDb"];

  constructor({
    selectCardDataFromDb
  } : GetCardListUsecaseProps<T>) {
    this.selectCardDataFromDb = selectCardDataFromDb;
  }

  async execute() : Promise<CardListDataProps> {

    // 나중에 로직을 변경 해서 ( 예를 들어서 cache에 따로 추가 하는 것이다 -> 그리고 상황에 따라서 cache를 들르게 하면 성능이 높아질것 같다는 기대 )

    // 1. 원하는 데이터 가져오기  -> 열, 거기에 해당하는 값 모두 필요 없다. 
    const datas : CardListDataProps = await this.selectCardDataFromDb.select({ attributeName : "", attributeValue : "" });

    return datas;
  }

};