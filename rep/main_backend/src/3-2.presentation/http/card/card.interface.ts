import { IdGenerator, PathMapping } from "@domain/shared";
import { Injectable } from "@nestjs/common";
import path from "path";
import { v7 as uuidV7 } from "uuid";


@Injectable()
export class CardIdGenerator implements IdGenerator {
  constructor() {}

  generate(): string {
    const user_id: string = uuidV7();
    return user_id;
  };
};

@Injectable()
export class CardItemPathMapping implements PathMapping {
  constructor() {}

  mapping(pathList: Array<string>): string {
    return path.posix.join(...pathList);
  }
};