export interface Messenger {
  lastMessage: string;
  lastMessageTime: string;
  user: {
    id: number;
    username: string;
    avatar?: string | null;
  };
}
