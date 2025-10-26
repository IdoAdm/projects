import React from 'react';
import type { ProfileConfig, SectionId } from '../index';
import { HEBREW_TRANSLATIONS, INITIAL_PLACEHOLDER_IMAGE } from '../constants/config';
import ProfileHeader from './cards/ProfileHeader';
import AboutCard from './cards/AboutCard';
import ServicesCard from './cards/ServicesCard';
import MembersLoungeCard from './cards/MembersLoungeCard';

interface PublishedLandingPageProps {
  config: ProfileConfig;
}

const fallbackSections: SectionId[] = ['about', 'services', 'lounge'];

const noopValueChange: <K extends keyof ProfileConfig>(key: K, value: ProfileConfig[K]) => void = () => undefined;
const noopUpload = () => undefined;

const PublishedLandingPage: React.FC<PublishedLandingPageProps> = ({ config }) => {
  const backgroundClass = `${config.styles.colorBackground ?? 'bg-white'} ${config.styles.backgroundOpacity ?? ''}`.trim();
  const isRtl = (config.styles.fontPairing ?? '').toLowerCase().includes('hebrew');

  const t = (key: string) => {
    if (isRtl && key in HEBREW_TRANSLATIONS) {
      return HEBREW_TRANSLATIONS[key as keyof typeof HEBREW_TRANSLATIONS];
    }
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  };

  const sections = (config.sections && config.sections.length > 0 ? config.sections : fallbackSections).filter(
    (section) => config.sectionVisibility?.[section] !== false,
  );

  const renderSection = (sectionId: SectionId) => {
    switch (sectionId) {
      case 'about':
        return (
          <AboutCard
            key="about"
            config={config}
            bio={config.bio}
            onBioChange={() => undefined}
            isRtl={isRtl}
            t={t}
            mode="view"
          />
        );
      case 'services':
        return (
          <ServicesCard
            key="services"
            config={config}
            services={config.services}
            onServiceChange={() => undefined}
            isRtl={isRtl}
            t={t}
            mode="view"
          />
        );
      case 'lounge':
        return (
          <section
            key="lounge"
            id="members-lounge"
            aria-labelledby="members-lounge-heading"
            className="scroll-mt-24"
          >
            <h2 id="members-lounge-heading" className="sr-only">
              Members Lounge
            </h2>
            <MembersLoungeCard
              config={config}
              lounge={config.lounge}
              isRtl={isRtl}
              mode="view"
            />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className={`${backgroundClass} min-h-screen`}>
      <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12 transition-all duration-300">
        <header className="mb-12">
          <ProfileHeader
            config={config}
            onValueChange={noopValueChange}
            onImageUpload={noopUpload}
            isRtl={isRtl}
            initialPlaceholderImage={INITIAL_PLACEHOLDER_IMAGE}
            mode="view"
          />
        </header>

        <div className="grid gap-8 md:gap-12 auto-rows-max">
          {sections.map((section) => renderSection(section))}
        </div>

        <footer className="text-center mt-16 pt-12">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-slate-700/30 transition-all duration-300">
            <div className="flex justify-center mb-4">
              <img src="/favicon.png" alt="Vena Logo" className="w-10 h-10" />
            </div>
            <p className={`text-slate-500 dark:text-slate-400 ${config.styles.fontBody}`}>
              {t('poweredBy')} <span className="font-semibold text-slate-700 dark:text-slate-300">Vena</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PublishedLandingPage;

