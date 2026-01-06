import { BaseError } from '../../error';

export class NotInsertRoomDataToCache extends BaseError {
  constructor() {
    super({
      message: '데이터가 cache에 저장되지 않았습니다.',
      status: 500,
    });
  }
}
