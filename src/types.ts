export interface MovieInfo {
  title: string;
  year: string;
  summary: string;
  director?: string;
  genre?: string;
}

export type LangType = 'uz' | 'ru' | 'en';

export interface UserProfile {
  uid: string;
  phone: string;
  displayName: string;
  role: 'admin' | 'user';
  dailyLimit: number;
  requestsToday: number;
  isActive: boolean;
  createdAt?: string;
}

// Backend HistoryItem bilan mos (camelCase)
export interface SearchHistory {
  id: string;
  userId: string;
  movieTitle: string;
  year?: string;
  imageUrl?: string;
  timestamp?: string;
  confidence?: string;
  genre?: string;
  director?: string;
  description?: string;
}

// Backend SystemSettings bilan mos
export interface AdminSettings {
  defaultDailyLimit?: number;
  adminDailyLimit?: number;
  totalUsers?: number;
  totalSearches?: number;
}

export interface TranslationType {
  title: string;
  home: string;
  help: string;
  heroTitle: string;
  heroSubtitle: string;
  description: string;
  uploadTitle: string;
  uploadDesc: string;
  identifyBtn: string;
  identifying: string;
  error: string;
  fileError: string;
  found: string;
  year: string;
  about: string;
  googleBtn: string;
  waiting: string;
  waitingDesc: string;
  footer: string;
  todayLimit: string;
  userLabel: string;
  history: string;
  profileTitle: string;
  changeName: string;
  changePassword: string;
  logout: string;
  saveChanges: string;
}
