
export type Genre = 'Fantasy' | 'Horror' | 'Romance' | 'Mystery' | 'Drama' | 'Sci-Fi';
export type UserRole = 'writer' | 'reader';
export type AppLanguage = 'en' | 'ar' | 'fr';

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Novel {
  id: string;
  title: string;
  content: string; // The full text or summary
  chapters?: Chapter[];
  authorId: string;
  authorUsername: string;
  genres: Genre[];
  publishedAt: string | null;
  createdAt: string;
  coverImage: string;
  isDraft: boolean;
  views: number;
  likes: number;
  language: AppLanguage;
  translations?: {
    [key in AppLanguage]?: {
      title: string;
      content: string;
    }
  };
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
  language: AppLanguage;
  preferredGenres?: Genre[];
}

export interface ReadingProgress {
  id?: string;
  uid: string;
  novelId: string;
  novelTitle: string;
  coverImage: string;
  authorUsername: string;
  percentage: number;
  scrollPosition: number;
  chapterIndex: number;
  lastReadAt: string;
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

export interface Bookmark {
  userId: string;
  novelId: string;
  createdAt: string;
}
