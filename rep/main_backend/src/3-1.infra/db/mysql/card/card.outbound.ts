import { InsertValueToDb } from "@app/ports/db/db.outbound";
import { Inject, Injectable } from "@nestjs/common";
import { ResultSetHeader, type Pool } from "mysql2/promise";
import { DB_CARD_STATS_ATTRIBUTE_NAME, DB_CARDS_ATTRIBUTE_NAME, DB_TABLE_NAME, MYSQL_DB } from "../../db.constants";
import { InsertCardAndCardStateDataProps } from "@app/card/commands/usecase";
import { DatabaseError } from "@error/infra/infra.error";


@Injectable()
export class InsertCardAndCardStateDataToMysql extends InsertValueToDb<Pool> {
  
  constructor(@Inject(MYSQL_DB) db : Pool ) { super(db); };

  private async insertData({
    db, entity
  } : {
    db : Pool, entity : InsertCardAndCardStateDataProps
  }) : Promise<boolean> {

    const connect = await db.getConnection();

    try {

      await connect.beginTransaction();

      // card 저장
      const cardTableName : string = DB_TABLE_NAME.CARDS;
      const cardSql : string = `
      INSERT INTO \`${cardTableName}\`(
      \`${DB_CARDS_ATTRIBUTE_NAME.CARD_ID}\`,
      \`${DB_CARDS_ATTRIBUTE_NAME.USER_ID}\`,
      \`${DB_CARDS_ATTRIBUTE_NAME.CATEGORY_ID}\`,
      \`${DB_CARDS_ATTRIBUTE_NAME.STATUS}\`,
      \`${DB_CARDS_ATTRIBUTE_NAME.TITLE}\`,
      \`${DB_CARDS_ATTRIBUTE_NAME.WORKSPACE_WIDTH}\`,
      \`${DB_CARDS_ATTRIBUTE_NAME.WORKSPACE_HEIGHT}\`,
      \`${DB_CARDS_ATTRIBUTE_NAME.BACKGROUND_COLOR}\`
      )
      VALUES (UUID_TO_BIN(?, true), UUID_TO_BIN(?, true), ?, ?, ?, ?, ?, ?)
      `;

      const cardData = entity.card;
      const [ cardInsert ] = await connect.query<ResultSetHeader>(cardSql, [ 
        cardData.card_id, 
        cardData.user_id, 
        cardData.category_id, 
        cardData.status,
        cardData.title,
        cardData.workspace_width,
        cardData.workspace_height,
        cardData.background_color
      ]);

      // card_stat 저장
      const cardStatTableName : string = DB_TABLE_NAME.CARD_STATS;
      const cardStatSql : string = `
      INSERT INTO \`${cardStatTableName}\`(
      \`${DB_CARD_STATS_ATTRIBUTE_NAME.CARD_ID}\`
      )
      VALUES (UUID_TO_BIN(?, true))
      `;

      const cardStat = entity.cardState;
      const [ cardStatInsert ] = await connect.query<ResultSetHeader>(cardStatSql, [ cardStat.card_id ]);
 
      await connect.commit();

      return cardInsert && cardInsert.affectedRows && cardStatInsert && cardStatInsert.affectedRows ? true : false;
    } catch (err) {
      if ( connect ) await connect.rollback();
      throw new DatabaseError(err);
    } finally {
      if ( connect ) connect.release();
    };

  };

  public async insert(entity: InsertCardAndCardStateDataProps): Promise<boolean> {
    
    const db = this.db;

    const insertChecked : boolean = await this.insertData({ db, entity });

    return insertChecked;
  };

};