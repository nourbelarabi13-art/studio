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

export interface ReadingPreferences {
  fontSize: number;
  lineHeight: number;
  mode: 'light' | 'sepia' | 'lavender' | 'midnight';
}

export interface Novel {
  id: string;
  title: string;
  content: string;
  chapters?: Chapter[];
  authorId: string;
  authorUsername: string;
  authorAvatar?: string;
  genres: Genre[];
  publishedAt: string | null;
  createdAt: string;
  coverImage: string;
  isDraft: boolean;
  views: number;
  likes: number;
  language: AppLanguage;
  country?: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  bio?: string;
  status?: string;
  avatar?: string;
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
  country?: string;
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

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  imageUrl?: string;
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

export interface Comment {
  id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  parentId?: string;
  createdAt: string;
}
