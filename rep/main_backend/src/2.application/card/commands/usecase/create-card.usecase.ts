import { CreateCardDto } from "@app/card/commands/dto";


type CreateCardUsecaseProps = {

};

export class CreateCardUsecase {


  constructor({

  } : CreateCardUsecaseProps) {

  }

  async execute( dto : CreateCardDto ) {

    // 1. 정합성 파악 

    // 2. 데이터 저장 ( card + card_stat )

    // 3. card_id 반환

  }

};