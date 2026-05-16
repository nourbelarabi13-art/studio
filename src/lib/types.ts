
export type Genre = 'Fantasy' | 'Horror' | 'Romance' | 'Mystery' | 'Drama' | 'Sci-Fi';
export type UserRole = 'writer' | 'reader';

export interface Novel {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorUsername: string;
  genres: Genre[];
  publishedAt: string | null;
  createdAt: string;
  coverImage: string;
  isDraft: boolean;
  views: number;
  likes: number;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  role: UserRole;
  ageConfirmed: boolean;
  createdAt: string;
  followerCount?: number;
  followingCount?: number;
}

export interface Follow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  category: string;
  lastMessageAt?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}
