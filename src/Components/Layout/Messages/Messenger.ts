import { User } from "./User";

export interface Messenger {
  user: User;
  lastMessage: string;
  lastMessageTime: string;
}