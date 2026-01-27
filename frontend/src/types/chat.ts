export type TextContent = {
  type: 'text';
  text: string;
};

export type ImageContent = {
  type: 'image';
  fileId: string;
  src: string;
  width?: number;
  height?: number;
};

export type FileCategory = 'image' | 'video' | 'audio' | 'text' | 'binary';

export type FileContent = {
  type: 'file';
  fileId: string;
  size: number;
  filename: string;
  category: FileCategory;
  fileUrl?: string;
};

export type ChatContent = TextContent | ImageContent | FileContent;

export interface ChatMessage {
  id: string;
  userId: string;
  nickname: string;
  profileImg?: string;
  createdAt: string;
  content: ChatContent;
}

export type UploadTicket =
  | {
      type: 'direct';
      file_id: string;
      direct: {
        upload_url: string;
      };
    }
  | {
      type: 'multipart';
      file_id: string;
      multipart: {
        upload_id: string;
        part_size: number;
        upload_urls: { part_number: number; upload_url: string }[];
      };
    }
  | {
      type: 'multipart_resume';
      file_id: string;
      multipart_resume: {
        upload_id: string;
        part_size: number;
        upload_urls: { part_number: number; upload_url: string }[];
        complete_parts: { part_number: number; etag: string }[];
      };
    }
  | {
      type: 'multipart_completed';
      file_id: string;
    };
