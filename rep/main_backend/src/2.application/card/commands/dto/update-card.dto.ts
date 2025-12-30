


export type UpdateCardInputDto = {
  card_id : string;
  category_id? : number;
  thumbnail_path?  : string | null;
  title? : string;
  workspace_width? : number;
  workspace_height? : number;
  background_color? : string;
};