export type TextContent = {
  type: 'TEXT';
  text: string;
};

export type ImageContent = {
  type: 'IMAGE';
  src: string;
};

export type FileContent = {
  type: 'FILE';
  fileName: string;
  size: number;
};

export type ChatContent = TextContent | ImageContent | FileContent;

export interface ChatMessage {
  id: string;
  userId: string;
  nickname: string;
  profileImg: string;
  createdAt: string;
  content: ChatContent;
}
