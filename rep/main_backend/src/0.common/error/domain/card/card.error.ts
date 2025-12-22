import { BaseError } from "../../error";


export class NotAllowStatusValue extends BaseError {
  constructor() {
    super({
      message: '카드에 상태를 다시 확인해주세요',
      status: 500,
    });
  };
};

export class NotAllowBackgroundColor extends BaseError {
  constructor() {
    super({
      message : "배경 색깔의 형식을 다시 확인해 주세요.",
      status : 500
    })
  };
};  

export class NotAllowCardItemType extends BaseError {
  constructor() {
    super({
      message : "카드 아이템 타입을 다시 확인해주세요",
      status : 500
    })
  };
};  

export class NotAllowRangeType extends BaseError {
  constructor({ name, min, max } : { name : string, min : number, max : number }) {
    super({
      message : `${name}은 ${min}이상 ${max}이하 여야 합니다.`,
      status : 500
    });
  };
};  