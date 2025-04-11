import { User } from "./User";

export interface Messenger {
  isOnline: any;
  unreadCount: number;
  hasUnread: any;
  lastMessageDate: any;
  user: User;
  lastMessage: string;
  lastMessageTime: string;
}