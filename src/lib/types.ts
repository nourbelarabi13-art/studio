
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
}

export interface Report {
  id: string;
  novelId: string;
  reporterId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}
