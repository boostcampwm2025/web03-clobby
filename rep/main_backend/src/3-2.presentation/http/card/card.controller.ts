import { Body, Controller, Post, Req, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { JwtGuard } from "../auth/guards";
import { type Request } from "express";
import { CardService } from "./card.service";
import { Payload } from "@app/auth/commands/dto";
import { CreateCardValidate } from "./card.validate";
import { CreateCardDto } from "@app/card/commands/dto";


@Controller("api/cards")
export class CardController {
  constructor(
    private readonly cardService : CardService
  ) {}

  @Post("")
  @UseGuards(JwtGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  )
  async createCardController(
    @Req() req : Request,
    @Body() cardDto : CreateCardValidate
  ) : Promise<Record<string, string>> {
    const payload : Payload = ( req as any ).user;
    const dto : CreateCardDto = {
      ...cardDto,
      user_id : payload.user_id
    };
    const card_id : string = await this.cardService.CreateCardService(dto);
    return {card_id};
  }

};