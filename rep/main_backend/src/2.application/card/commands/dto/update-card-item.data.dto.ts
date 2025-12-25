


export type UpdateCardItemInfoProps = {
  item_id : string;
  card_id : string;
  type : 'text' | 'image' | 'video';
  path : string;
  mime_type : 'image/apng' | 'image/avif' | 'image/gif' | 'image/jpeg' | 'image/png' | 'image/svg+xml' | 'image/webp' | 'video/mp4' | 'video/webm' | 'video/ogg';
  size : number;
};

export type UpdateCardItemAssetValueProps = {
  key_name : string | undefined;
  mime_type : 'image/apng' | 'image/avif' | 'image/gif' | 'image/jpeg' | 'image/png' | 'image/svg+xml' | 'image/webp' | 'video/mp4' | 'video/webm' | 'video/ogg' | undefined;
  size : number | undefined;
  status : 'uploading' | 'ready' | 'failed' | undefined;
  upload_id : string | undefined;
};