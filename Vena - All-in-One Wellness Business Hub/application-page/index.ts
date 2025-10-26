import { FONT_THEMES } from './constants/themes';

export type SectionId = 'about' | 'services' | 'lounge';
export type FontThemeKey = keyof typeof FONT_THEMES;

export interface ProfileMeta {
  lang: 'en' | 'he';
}

export interface Service {
  id: number;
  title: string;
  description: string;
}

export interface LandingPageMeta {
  slug: string;
  published: boolean;
  publishedAt?: string | null;
  lastUpdatedAt?: string | null;
}

export interface LoungePost {
  id: string;
  title: string;
  body: string;
  tags: string[];
  authorName: string;
  authorRole: string;
  authorAvatarUrl?: string;
  coverImageUrl?: string;
  createdAt: string;
  likes: number;
  saves: number;
  pinned?: boolean;
}

export interface LoungeConfig {
  headline: string;
  description: string;
  searchPlaceholder: string;
  posts: LoungePost[];
}

export interface ProfileConfig {
  templateId: string;
  name: string;
  title: string;
  bio: string;
  profileImage: string;
  email: string;
  phone: string;
  services: Service[];
  lounge: LoungeConfig;
  meta?: ProfileMeta;
  sections: SectionId[];
  sectionVisibility: Record<SectionId, boolean>;
  styles: {
    fontPairing: FontThemeKey;
    fontHeading: string;
    fontBody: string;
    colorPrimary: string;
    colorSecondary: string;
    colorBackground: string;
    backgroundOpacity: string;
  };
  landingPage?: LandingPageMeta;
}

