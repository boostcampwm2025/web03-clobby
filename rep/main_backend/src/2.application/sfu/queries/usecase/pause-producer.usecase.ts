import { Injectable } from "@nestjs/common";
import { PauseProducerDto } from "../dto";


type PauseProducerUsecaseProps<T> = {

};

@Injectable()
export class PauseProducerUsecase<T> {

  constructor({

  } : PauseProducerUsecaseProps<T>) {}

  // 실제로 멈추게 하는 로직 
  async execute(dto : PauseProducerDto) {

    // 1. 실제로 방에 위치해 있고 유저가 맞는지 확인

    // 2. 그 유저의 producer를 잠시 멈춤 한다. 

    // 3. 상태를 변경해준다. 

  };
};