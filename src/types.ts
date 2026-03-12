export interface MovieInfo {
  title: string;
  year: string;
  summary: string;
}

export type LangType = 'uz' | 'ru' | 'en';

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  dailyLimit: number;
  requestsToday: number;
  lastRequestDate: string;
}

export interface AdminSettings {
  login: string;
  pass: string;
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
}
