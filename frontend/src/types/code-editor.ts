export type CursorState = {
  lineNumber: number;
  column: number;
};

export type UserRole = 'viewer' | 'presenter';

export type UserState = {
  name: string;
  role: UserRole;
};

export type AwarenessState = {
  user?: UserState;
  cursor?: CursorState | null;
};
