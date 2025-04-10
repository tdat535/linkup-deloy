export interface MessengerDetail {
  id: number;
  content: string;
  image?: string | null;
  senderId: number;
  receiverId: number;
  receivingDate?: string | null;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: number;
    username: string;
    avatar: string | null;
  };
}
