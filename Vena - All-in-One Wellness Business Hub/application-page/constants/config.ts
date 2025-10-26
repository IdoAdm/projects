import type { ProfileConfig, LoungePost } from '../index';
import { FONT_THEMES } from './themes';

export const INITIAL_PLACEHOLDER_IMAGE = 'https://i.imgur.com/rS42r8s.png';

const DEFAULT_LOUNGE_POSTS: LoungePost[] = [
  {
    id: 'lounge-1',
    title: 'Weekly Breathwork Reset',
    body: 'A guided audio to help members decompress after busy days. Encourage them to pair it with gentle movement.',
    tags: ['breathwork', 'audio', 'reset'],
    authorName: 'Team Vena',
    authorRole: 'Community Coach',
    authorAvatarUrl: 'https://i.pravatar.cc/80?u=vena-community-coach',
    coverImageUrl: 'https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=900&q=80',
    createdAt: '2024-07-15T14:30:00.000Z',
    likes: 18,
    saves: 7,
    pinned: true,
  },
  {
    id: 'lounge-2',
    title: 'Mobility Challenge: 5 Days of Flow',
    body: 'Share this carousel and invite members to post their favorite stretch in the comments. Celebrate completions on Friday.',
    tags: ['mobility', 'challenge', 'community'],
    authorName: 'You',
    authorRole: 'Coach Update',
    authorAvatarUrl: 'https://i.pravatar.cc/80?u=vena-coach-update',
    coverImageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80',
    createdAt: '2024-07-12T10:15:00.000Z',
    likes: 42,
    saves: 21,
  },
  {
    id: 'lounge-3',
    title: 'Spotify Playlist: Slow Sunrise',
    body: 'Curated downtempo tracks for early morning routines. Perfect to pair with journal prompts or a cold plunge.',
    tags: ['playlist', 'recovery'],
    authorName: 'Community Manager',
    authorRole: 'Curated Drop',
    authorAvatarUrl: 'https://i.pravatar.cc/80?u=vena-community-manager',
    coverImageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
    createdAt: '2024-07-05T08:00:00.000Z',
    likes: 33,
    saves: 14,
  },
];

export const HEBREW_TRANSLATIONS = {
  aboutMe: 'עליי',
  myServices: 'השירותים שלי',
  poweredBy: 'נוצר באמצעות'
};

const BASE_DEFAULT_CONFIG: Omit<ProfileConfig, 'styles'> = {
  templateId: 'scratch',
  name: 'Your Name',
  title: 'Wellness Professional',
  bio: 'Welcome to my wellness space. Here, I share my passion for helping others achieve balance and health through personalized programs and guidance.',
  profileImage: '',
  email: '',
  phone: '',
  services: [
    { id: 1, title: '1-on-1 Physiotherapy', description: 'Personalized sessions to address your specific needs and goals.' },
    { id: 2, title: 'Group Yoga Class', description: 'Join our community for a revitalizing group yoga experience.' },
    { id: 3, title: 'Nutrition Planning', description: 'Custom meal plans to complement your wellness journey.' },
  ],
  lounge: {
    headline: "Members' Lounge",
    description: 'Keep your clients close with curated updates, guided resources, and celebrations from your practice.',
    searchPlaceholder: 'Search posts or tags...',
    posts: DEFAULT_LOUNGE_POSTS,
  },
  meta: { lang: 'en' },
  sections: ['about', 'services', 'lounge'],
  sectionVisibility: { about: true, services: true, lounge: true },
  landingPage: { slug: '', published: false, publishedAt: null, lastUpdatedAt: null },
};

export const getInitialConfig = (language: 'en' | 'he'): ProfileConfig => {
    const isHebrew = language === 'he';
    const lang: 'en' | 'he' = isHebrew ? 'he' : 'en';
    const clonedServices = BASE_DEFAULT_CONFIG.services.map((service) => ({ ...service }));
    const clonedPosts = BASE_DEFAULT_CONFIG.lounge.posts.map((post) => ({ ...post }));

    const lounge = {
        ...BASE_DEFAULT_CONFIG.lounge,
        posts: clonedPosts,
    };

    const defaultConfig = {
        ...BASE_DEFAULT_CONFIG,
        services: clonedServices,
        lounge,
        sections: [...BASE_DEFAULT_CONFIG.sections],
        sectionVisibility: { ...BASE_DEFAULT_CONFIG.sectionVisibility },
        meta: { lang },
        name: isHebrew ? '??? ????' : BASE_DEFAULT_CONFIG.name,
        title: isHebrew ? '?????? ????? ???????' : BASE_DEFAULT_CONFIG.title,
        bio: isHebrew ? '?????? ????? ????? ??????? ???. ??? ??? ????/? ?? ?????? ??? ????? ?????? ????? ????? ??????? ??????? ?????? ?????? ??????? ?????.' : BASE_DEFAULT_CONFIG.bio,
    };

    return {
        ...defaultConfig,
        styles: {
            fontPairing: isHebrew ? 'hebrew_default' : 'default',
            fontHeading: isHebrew ? FONT_THEMES.hebrew_default.heading : FONT_THEMES.default.heading,
            fontBody: isHebrew ? FONT_THEMES.hebrew_default.body : FONT_THEMES.default.body,
            colorPrimary: 'bg-blue-600',
            colorSecondary: 'text-blue-600',
            colorBackground: 'bg-white',
            backgroundOpacity: 'bg-opacity-100',
        },
    };
};

export const TEMPLATES: Record<string, Partial<ProfileConfig>> = {
  warm: { 
    templateId: 'warm', 
    name: 'Sarah Williams',
    title: 'Holistic Wellness Coach',
    bio: 'Creating warm, nurturing spaces for healing and personal growth. Specializing in mindfulness practices and gentle wellness approaches that honor your unique journey.',
    services: [
      { id: 1, title: 'Heart-Centered Coaching', description: 'Compassionate guidance to reconnect with your inner wisdom and authentic self.' },
      { id: 2, title: 'Mindful Living Sessions', description: 'Learn to embrace presence and find joy in everyday moments.' },
      { id: 3, title: 'Emotional Wellness Support', description: 'Safe space to process feelings and develop emotional resilience.' },
    ],
    styles: { 
      ...(getInitialConfig('en').styles), 
      fontPairing: 'serif', 
      fontHeading: FONT_THEMES.serif.heading, 
      fontBody: FONT_THEMES.serif.body, 
      colorPrimary: 'bg-gradient-to-br from-orange-500 to-amber-600', 
      colorSecondary: 'text-orange-600', 
      colorBackground: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50',
      backgroundOpacity: 'bg-opacity-90'
    }, 
    sections: ['about', 'services', 'lounge'] 
  },
  nature: { 
    templateId: 'nature',
    name: 'Marcus Green', 
    title: 'Nature-Based Therapist',
    bio: 'Connecting you with the healing power of nature through outdoor therapy, forest bathing, and earth-centered wellness practices that restore your natural balance.',
    services: [
      { id: 1, title: 'Forest Bathing Sessions', description: 'Immersive nature experiences to reduce stress and restore vitality.' },
      { id: 2, title: 'Outdoor Adventure Therapy', description: 'Healing through movement and connection with natural environments.' },
      { id: 3, title: 'Seasonal Wellness Rituals', description: 'Align your energy with nature\'s rhythms throughout the year.' },
    ],
    styles: { 
      ...(getInitialConfig('en').styles), 
      fontPairing: 'modern', 
      fontHeading: FONT_THEMES.modern.heading, 
      fontBody: FONT_THEMES.modern.body, 
      colorPrimary: 'bg-gradient-to-br from-emerald-600 to-green-700', 
      colorSecondary: 'text-emerald-700', 
      colorBackground: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
      backgroundOpacity: 'bg-opacity-95'
    }, 
    sections: ['about', 'services', 'lounge'] 
  },
  ambient: { 
    templateId: 'ambient',
    name: 'Alex Stone',
    title: 'Minimalist Life Designer', 
    bio: 'Embracing simplicity and intentional living. I help busy professionals find clarity, reduce overwhelm, and create space for what truly matters in their lives.',
    services: [
      { id: 1, title: 'Digital Minimalism Coaching', description: 'Streamline your digital life for focus and mental clarity.' },
      { id: 2, title: 'Intentional Space Design', description: 'Create environments that support your goals and well-being.' },
      { id: 3, title: 'Essential Priority Planning', description: 'Identify and focus on what truly moves the needle in your life.' },
    ],
    styles: { 
      ...(getInitialConfig('en').styles), 
      fontPairing: 'minimal', 
      fontHeading: FONT_THEMES.minimal.heading, 
      fontBody: FONT_THEMES.minimal.body, 
      colorPrimary: 'bg-gradient-to-br from-slate-700 to-gray-800', 
      colorSecondary: 'text-slate-600', 
      colorBackground: 'bg-gradient-to-br from-slate-100 via-gray-50 to-zinc-50',
      backgroundOpacity: 'bg-opacity-100'
    }, 
    sections: ['about', 'services', 'lounge'] 
  },
  tranquil: { 
    templateId: 'tranquil',
    name: 'Luna Azure',
    title: 'Meditation & Flow Guide',
    bio: 'Guiding you into states of deep tranquility through breathwork, meditation, and movement practices that cultivate inner peace and emotional balance.',
    services: [
      { id: 1, title: 'Breathwork Journeys', description: 'Transformative breathing practices for deep healing and clarity.' },
      { id: 2, title: 'Flowing Meditation', description: 'Movement-based meditation to harmonize body, mind, and spirit.' },
      { id: 3, title: 'Inner Peace Retreats', description: 'Immersive experiences to deepen your practice and find stillness.' },
    ],
    styles: { 
      ...(getInitialConfig('en').styles), 
      fontPairing: 'default', 
      fontHeading: FONT_THEMES.default.heading, 
      fontBody: FONT_THEMES.default.body, 
      colorPrimary: 'bg-gradient-to-br from-sky-500 to-cyan-600', 
      colorSecondary: 'text-sky-600', 
      colorBackground: 'bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50',
      backgroundOpacity: 'bg-opacity-90'
    }, 
    sections: ['about', 'services', 'lounge'] 
  },
  serene: { 
    templateId: 'serene',
    name: 'Violet Sage',
    title: 'Spiritual Wellness Guide',
    bio: 'Creating sacred spaces for deep transformation through energy healing, crystal therapy, and intuitive guidance that honors your soul\'s wisdom and inner knowing.',
    services: [
      { id: 1, title: 'Energy Healing Sessions', description: 'Rebalance your chakras and release energetic blockages for renewal.' },
      { id: 2, title: 'Crystal Therapy Treatments', description: 'Harness the power of crystals for healing and manifestation.' },
      { id: 3, title: 'Intuitive Soul Readings', description: 'Connect with your higher self for guidance and spiritual clarity.' },
    ],
    styles: { 
      ...(getInitialConfig('en').styles), 
      fontPairing: 'serif', 
      fontHeading: FONT_THEMES.serif.heading, 
      fontBody: FONT_THEMES.serif.body, 
      colorPrimary: 'bg-gradient-to-br from-indigo-600 to-purple-700', 
      colorSecondary: 'text-indigo-600', 
      colorBackground: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50',
      backgroundOpacity: 'bg-opacity-85'
    }, 
    sections: ['about', 'services', 'lounge'] 
  },
};



