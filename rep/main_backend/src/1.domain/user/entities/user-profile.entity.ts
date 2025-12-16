import { idVo } from "@domain/shared";
import { 
  memeTypeVo, 
  profilePathVo, 
  userIdVo, 
  UserProfileProps 
} from "@domain/user/user.vo";


export class UserProfile {

  private readonly id : UserProfileProps["id"];
  private readonly user_id : UserProfileProps["user_id"];
  private readonly profile_path : UserProfileProps["profile_path"];
  private readonly meme_type : UserProfileProps["meme_type"];
  private readonly created_at : Exclude<UserProfileProps["created_at"], undefined>;
  private readonly updated_at : Exclude<UserProfileProps["updated_at"], undefined>;

  constructor({
    id, user_id, profile_path, meme_type, created_at = new Date(), updated_at = new Date()
  } : UserProfileProps) {

    this.id = idVo(id);
    this.user_id = userIdVo(user_id);
    this.profile_path = profilePathVo(profile_path);
    this.meme_type = memeTypeVo(meme_type);
    this.created_at = created_at && created_at instanceof Date ? created_at : new Date();
    this.updated_at = updated_at && updated_at instanceof Date ? updated_at : new Date();

    Object.freeze(this);
  };

  public getId() : UserProfileProps["id"] { return this.id; };
  public getUserId() : UserProfileProps["user_id"] { return this.user_id; };
  public getProfilePath() : UserProfileProps["profile_path"] { return this.profile_path; };
  public getMemeType() : UserProfileProps["meme_type"] { return this.meme_type; };
  public getCreatedAt() : Exclude<UserProfileProps["created_at"], undefined> { return this.created_at; };
  public getUpdatedAt() : Exclude<UserProfileProps["updated_at"], undefined> { return this.updated_at; };

  public getData() : Required<UserProfileProps> {
    return {
      id : this.id,
      user_id : this.user_id,
      profile_path : this.profile_path,
      meme_type : this.meme_type,
      created_at : this.created_at,
      updated_at : this.updated_at
    };
  };

};