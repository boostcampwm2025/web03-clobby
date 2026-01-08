import { BaseError } from '../../error';

export class SfuError extends BaseError {
  constructor(err: Error) {
    super({
      message: `${err}`,
      status: 500,
    });
  }
}