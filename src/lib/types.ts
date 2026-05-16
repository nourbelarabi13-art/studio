
export type Genre = 'Fantasy' | 'Horror' | 'Romance' | 'Mystery' | 'Drama' | 'Sci-Fi';
export type UserRole = 'writer' | 'reader';
export type AppLanguage = 'en' | 'ar' | 'fr';
export type BookmarkCategory = 'favorite' | 'read-later';
export type NotificationType = 'like' | 'comment' | 'story' | 'follow';

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

export interface ReadingPreferences {
  fontSize: number;
  lineHeight: number;
  mode: 'light' | 'pink' | 'lavender' | 'midnight';
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  bio?: string;
  role: UserRole;
  ageConfirmed: boolean;
  createdAt: string;
  followerCount?: number;
  followingCount?: number;
  totalViews?: number;
  totalLikes?: number;
  publishedCount?: number;
  achievements?: string[];
  language: AppLanguage;
  preferredGenres?: Genre[];
  readingPreferences?: ReadingPreferences;
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
  genres?: Genre[];
}

export interface Follow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Notification {
  id?: string;
  type: NotificationType;
  message: string;
  fromUserId?: string;
  fromUserName?: string;
  targetId?: string;
  read: boolean;
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
  uid: string;
  novelId: string;
  novelTitle: string;
  coverImage: string;
  authorUsername: string;
  category: BookmarkCategory;
  createdAt: string;
  genres?: Genre[];
}
