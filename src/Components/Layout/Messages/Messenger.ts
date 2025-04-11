import { User } from "./User";

export interface Messenger {
  isOnline: any;
  unreadCount: number;
  user: User;
  lastMessage: string;
  lastMessageTime: string;
}