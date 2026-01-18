
export enum AppMode {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  STUDIO = 'STUDIO',
  TEMPLATES = 'TEMPLATES',
  LIBRARY = 'LIBRARY',
  BILLING = 'BILLING'
}

export enum GenerationMode {
  MENU = 'MENU',
  SOCIAL = 'SOCIAL'
}

export enum PhotoAngle {
  TOP_DOWN = 'TOP_DOWN',
  HERO_45 = 'HERO_45',
  SIDE = 'SIDE',
  MACRO = 'MACRO',
  BATCH_4 = 'BATCH_4'
}

export enum AspectRatio {
  SQUARE_1_1 = '1:1',
  PORTRAIT_3_4 = '3:4',
  LANDSCAPE_4_3 = '4:3',
  STORY_9_16 = '9:16',
  CINEMA_16_9 = '16:9'
}

export interface User {
  id: string;
  email: string;
  companyName: string;
  plan: 'starter' | 'pro' | 'agency';
  generationsCount: number;
}

export interface ParsedDish {
  id: string;
  name: string;
  description?: string;
  price?: string;
}

export interface StyleTemplate {
  id: string;
  name: string;
  backgroundId: string;
  lightingStyle: string;
  focusStyle: string;
  angle: PhotoAngle;
  aspectRatio: AspectRatio;
}

export interface SavedGeneration {
  id: string;
  dishName: string;
  imageUrl: string;
  mode: GenerationMode;
  createdAt: number;
}
