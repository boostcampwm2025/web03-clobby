import { BaseError } from "../../error";


export class NotCreateCardStateError extends BaseError {
  constructor() {
    super({
      message: 'card state를 만들지 못했습니다.',
      status: 500,
    });
  }
};

export class NotCreateCardAndCardStateError extends BaseError {
  constructor() {
    super({
      message: 'card와 card state를 db에 생성하지 못했습니다.',
      status: 500,
    });
  };
};