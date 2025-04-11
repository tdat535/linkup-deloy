export interface User {
    isOnline: any;
    id: number;
    username: string;
    avatar?: string | null; // Cho phép avatar là null hoặc undefined
  }