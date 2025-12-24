import { SelectDataFromDb } from "@app/ports/db/db.inbound";
import { Inject, Injectable } from "@nestjs/common";
import { RowDataPacket, type Pool } from "mysql2/promise";
import { DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME, DB_TABLE_NAME, MYSQL_DB } from "../../db.constants";
import { CardItemAssetProps, CardItemAssetStatusProps } from "@domain/card/vo";


interface CardItemAssetRowPacket extends RowDataPacket {
  [ DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.CARD_ID ] : string;
  [ DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.ITEM_ID ] : string;
  [ DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.KEY_NAME ] : string;
  [ DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.MIME_TYPE ] : string;
  [ DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.STATUS ] : CardItemAssetStatusProps;
  [ DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.SIZE ] : number;
  [ DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.CREATED_AT ] : Date;
  [ DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.UPDATED_AT ] : Date;
};

@Injectable()
export class SelectCardItemAssetFromMysql extends SelectDataFromDb<Pool> {

  constructor(
    @Inject(MYSQL_DB) db : Pool,
  ) { super(db); };

  private async selectData({
    db, tableName, attributeName, attributeValue
  } : {
    db : Pool; tableName : string; attributeName: string; attributeValue: string;
  }) : Promise<CardItemAssetRowPacket | undefined> {

    const sql : string = `
    SELECT 
    \`${DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.CARD_ID}\`,
    \`${DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.ITEM_ID}\`,
    \`${DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.KEY_NAME}\`,
    \`${DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.MIME_TYPE}\`,
    \`${DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.STATUS}\`,
    \`${DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.SIZE}\`,
    \`${DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.CREATED_AT}\`,
    \`${DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.UPDATED_AT}\`
    FROM \`${tableName}\`
    WHERE \`${attributeName}\` = ?
    LIMIT 1
    `;

    const [ cardItemAsset ] = await db.query<Array<CardItemAssetRowPacket>>(sql, [ attributeValue ]);

    return cardItemAsset && cardItemAsset[0]
  }

  async select({ attributeName, attributeValue }: { attributeName: string; attributeValue: string; }): Promise<Required<CardItemAssetProps> | undefined> {
    
    const db : Pool = this.db;
    const tableName : string = DB_TABLE_NAME.CARD_ITEM_ASSETS;

    const cardItemAsset = await this.selectData({ db, tableName, attributeName, attributeValue });

    if ( !cardItemAsset ) return undefined;

    return {
      card_id : cardItemAsset[DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.CARD_ID],
      item_id : cardItemAsset[DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.ITEM_ID],
      key_name : cardItemAsset[DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.KEY_NAME],
      mime_type : cardItemAsset[DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.MIME_TYPE],
      status : cardItemAsset[DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.STATUS],
      size : cardItemAsset[DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.SIZE],
      created_at : cardItemAsset[DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.CREATED_AT],
      updated_at : cardItemAsset[DB_CARD_ITEM_ASSETS_ATTRIBUTE_NAME.UPDATED_AT]
    };
  };

};