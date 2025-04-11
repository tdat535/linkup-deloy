import { User } from "./User";

export interface MessengerDetail {
  id: number;
  content: string;
  image: string | null;
  receivingDate: string | null;
  createdAt: string;
  updatedAt: string;
  senderId: number;
  receiverId: number;
  sender: User;
}