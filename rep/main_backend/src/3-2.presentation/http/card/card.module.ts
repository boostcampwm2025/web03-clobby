import { Module } from "@nestjs/common";
import { CardController } from "./card.controller";
import { AuthModule } from "../auth/auth.module";
import { CardService } from "./card.service";
import { CreateCardUsecase, UploadingCardItemUsecase } from "@app/card/commands/usecase";
import { CardIdGenerator } from "./card.interface";
import { DeleteCardItemAndCardAssetDataToMysql, InsertCardAndCardStateDataToMysql, InsertCardItemAndCardAssetDataToMysql, InsertCardItemDataToMysql } from "@infra/db/mysql/card/card.outbound";
import { GetMultipartUploadIdFromS3Bucket, GetPresignedUrlFromS3Bucket } from "@infra/disk/s3/adapters/disk.inbound";
import { InsertCardItemAssetInitDataToRedis } from "@infra/cache/redis/card/card.outbound";


@Module({
  imports : [
    AuthModule
  ],
  controllers : [
    CardController
  ],
  providers : [
    CardService,
    CardIdGenerator,

    // card를 생성할때 사용하는 모듈
    {
      provide : CreateCardUsecase,
      useFactory : (
        cardIdGenrator : CardIdGenerator,
        insertCardAndCardStateToDb : InsertCardAndCardStateDataToMysql
      ) => {  
        return new CreateCardUsecase({
          cardIdGenrator, insertCardAndCardStateToDb
        });
      },
      inject : [
        CardIdGenerator, InsertCardAndCardStateDataToMysql
      ]
    },

    // card에 item을 생성할때 
    {
      provide : UploadingCardItemUsecase,
      useFactory : (
        itemIdGenerator : CardIdGenerator,
        insertCardItemToDb : InsertCardItemDataToMysql,
        insertCardItemAndCardItemAssetToDb : InsertCardItemAndCardAssetDataToMysql,
        deleteCardItemAndCardItemAssetToDb : DeleteCardItemAndCardAssetDataToMysql,
        getUploadUrlFromDisk : GetPresignedUrlFromS3Bucket,
        getMultiVerGroupIdFromDisk : GetMultipartUploadIdFromS3Bucket,
        insertCardItemAssetToCache : InsertCardItemAssetInitDataToRedis
      ) => {
        return new UploadingCardItemUsecase({
          itemIdGenerator, insertCardItemToDb, insertCardItemAndCardItemAssetToDb, deleteCardItemAndCardItemAssetToDb, getUploadUrlFromDisk, getMultiVerGroupIdFromDisk, insertCardItemAssetToCache
        });
      },
      inject : [
        CardIdGenerator,
        InsertCardItemDataToMysql,
        InsertCardItemAndCardAssetDataToMysql,
        DeleteCardItemAndCardAssetDataToMysql,
        GetPresignedUrlFromS3Bucket,
        GetMultipartUploadIdFromS3Bucket,
        InsertCardItemAssetInitDataToRedis
      ]
    }
    

  ],
})
export class CardModule{};