import React from 'react';
import BaseCard from './BaseCard';
import type { ProfileConfig } from '../../index';

interface AboutCardProps {
  config: ProfileConfig;
  bio: string;
  onBioChange: (value: string) => void;
  isRtl: boolean;
  t: (key: string) => string;
  mode?: 'edit' | 'view';
}

const AboutCard: React.FC<AboutCardProps> = ({
  config,
  bio,
  onBioChange,
  isRtl,
  t,
  mode = 'edit',
}) => {
  const isView = mode === 'view';
  const dirAttr = isRtl ? 'rtl' : 'ltr';
  const textareaClasses = `${config.styles.fontBody} text-slate-700 dark:text-slate-300 text-lg leading-relaxed`;

  return (
    <BaseCard variant="glass" className="text-center">
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className={`w-16 h-16 rounded-full ${config.styles.colorPrimary} flex items-center justify-center shadow-lg`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>

        <h2 className={`text-3xl font-bold ${config.styles.fontHeading} ${config.styles.colorSecondary} relative`}>
          {t('aboutMe')}
          <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 ${config.styles.colorPrimary} rounded-full`} />
        </h2>

        <div className="max-w-3xl mx-auto">
          {isView ? (
            <p className={`${textareaClasses} whitespace-pre-line`} dir={dirAttr}>
              {bio || t('aboutMePlaceholder') || 'Tell your story...'}
            </p>
          ) : (
            <textarea
              value={bio}
              onChange={(event) => onBioChange(event.target.value)}
              className={`bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/30 rounded-md px-2 py-1 w-full resize-none min-h-[120px] leading-relaxed ${textareaClasses}`}
              placeholder={t('aboutMePlaceholder') || 'Tell your story...'}
              dir={dirAttr}
            />
          )}
        </div>

        <div className="flex justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${config.styles.colorPrimary} opacity-60`} />
          <div className={`w-2 h-2 rounded-full ${config.styles.colorPrimary} opacity-40`} />
          <div className={`w-2 h-2 rounded-full ${config.styles.colorPrimary} opacity-20`} />
        </div>
      </div>
    </BaseCard>
  );
};

export default AboutCard;
