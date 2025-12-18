
export type Locale = 'en' | 'pt';
export type Theme = 'dark' | 'light';

export interface Comic {
  id: string;
  name: string;
  format: 'pdf' | 'epub' | 'cbz';
  fileData: File;
  thumbnail?: string;
  lastRead?: string;
  isFavorite: boolean;
  totalPages: number;
  currentPage: number;
}

export interface Translations {
  welcome: string;
  subtitle: string;
  uploadButton: string;
  allEditions: string;
  noEditions: string;
  noEditionsSub: string;
  home: string;
  uploadLabel: string;
  language: string;
  themeToggle: string;
  back: string;
  lastRead: string;
  favorites: string;
}
