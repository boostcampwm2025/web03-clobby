jest.mock('@/guards/guard.service', () => {
  return {
    GuardService: jest.fn().mockImplementation(() => ({
      verify: jest.fn(),
    })),
  };
});

import { CodeeditorService } from "@/codeeditor/codeeditor.service";
import { RedisClientType } from "redis";
import { Test } from "@nestjs/testing";
import { GuardService } from "@/guards/guard.service";
import { REDIS_SERVER } from "@/infra/cache/cache.constants";
import { CodeeditorRepository } from "@/infra/memory/tool";


describe("codeeditor service 함수의 단위 테스트 진행", () => {
  
  // 테스트를 위한 mock 함수 정리
  let service: CodeeditorService;

  const redisMock: Partial<RedisClientType> = {
    hGetAll: jest.fn(),
    xRange: jest.fn(),
    xAdd: jest.fn(),
    xRevRange: jest.fn(),
    multi: jest.fn(),
  };

  const guardMock = {
    verify: jest.fn(),
  };

  const repoMock = {
    get: jest.fn(),
    ensure: jest.fn(),
    encodeFull: jest.fn(),
    applySnapshot: jest.fn(),
    applyAndAppendUpdate: jest.fn(),
    encodeSnapshot: jest.fn(),
  };

  beforeEach(async () => {

    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers : [
        CodeeditorService,
        {
          provide : GuardService, useValue : guardMock
        },
        {
          provide : REDIS_SERVER, useValue : redisMock
        },
        {
          provide : CodeeditorRepository, useValue : repoMock
        }
      ]
    }).compile();

    service = moduleRef.get(CodeeditorService);
  });

  test("makeNamespace는 CODEEDITOR:ws:<room_id> 형태를 만든다", () => {
    expect(service.makeNamespace('room-1')).toBe('codeeditor:ws:room-1'); 
  });

});