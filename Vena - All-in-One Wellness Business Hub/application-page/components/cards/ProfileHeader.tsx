import React, { useRef } from 'react';
import BaseCard from './BaseCard';
import type { ProfileConfig } from '../../index';

interface ProfileHeaderProps {
  config: ProfileConfig;
  onValueChange: <K extends keyof ProfileConfig>(key: K, value: ProfileConfig[K]) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isRtl: boolean;
  initialPlaceholderImage: string;
  mode?: 'edit' | 'view';
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  config,
  onValueChange,
  onImageUpload,
  isRtl,
  initialPlaceholderImage,
  mode = 'edit',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isView = mode === 'view';
  const dirAttr = isRtl ? 'rtl' : 'ltr';
  const loungeVisible = config.sectionVisibility?.lounge !== false;

  const baseInputClasses =
    'bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/30 rounded-md px-3 py-2 w-full text-center transition-all duration-200 hover:bg-white/10 dark:hover:bg-slate-700/30';
  const readOnlyExtras = 'pointer-events-none focus:ring-0 focus:outline-none hover:bg-transparent';

  const getInputClass = (extra: string = '') =>
    `${baseInputClasses} ${extra}${isView ? ` ${readOnlyExtras}` : ''}`.trim();

  const handleValueChange = <K extends keyof ProfileConfig>(key: K) =>
    (value: ProfileConfig[K]) => {
      if (isView) {
        return;
      }
      onValueChange(key, value);
    };

  const renderTextField = <K extends keyof ProfileConfig>(
    key: K,
    placeholder: string,
    className: string,
  ) => {
    const value = (config[key] as unknown as string) || '';

    if (isView) {
      return (
        <p className={className} dir={dirAttr}>
          {value || placeholder}
        </p>
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(event) => handleValueChange(key)(event.target.value as ProfileConfig[K])}
        className={getInputClass(className)}
        placeholder={placeholder}
        dir={dirAttr}
      />
    );
  };

  const renderContactField = (
    type: 'email' | 'tel',
    value: string,
    placeholder: string,
    className: string,
  ) => {
    if (isView) {
      return (
        <span className={`${className} ${config.styles.fontBody}`} dir={dirAttr}>
          {value || placeholder}
        </span>
      );
    }

    return (
      <input
        type={type}
        value={value}
        onChange={(event) => {
          if (type === 'email') {
            handleValueChange('email')(event.target.value as ProfileConfig['email']);
          } else {
            handleValueChange('phone')(event.target.value as ProfileConfig['phone']);
          }
        }}
        className={getInputClass(className)}
        placeholder={placeholder}
        dir={dirAttr}
      />
    );
  };

  const handleMembersLoungeClick = () => {
    if (!loungeVisible || typeof document === 'undefined') {
      return;
    }
    const target = document.getElementById('members-lounge');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/80 to-gray-100/60 dark:from-slate-900 dark:via-slate-800/90 dark:to-gray-900/80 rounded-3xl" />

      <BaseCard
        variant="glass"
        padding="sm"
        className="relative overflow-hidden border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/50"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.02] dark:opacity-[0.05]">
            <div className="absolute inset-0 bg-gradient-to-bl from-slate-900 via-transparent to-transparent transform rotate-12" />
          </div>

          <div
            className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative z-10 p-12 lg:p-16">
          <div className="flex flex-col lg:flex-row items-center lg:items-center gap-12 lg:gap-16">
            <div className="flex-shrink-0 flex flex-col items-center gap-6">
              <div className={`relative group ${isView ? 'pointer-events-none' : ''}`}>
                <div className="relative">
                  <div className="relative">
                    <div className="relative w-48 h-48 lg:w-60 lg:h-60 mx-auto">
                      {config.profileImage ? (
                        <img
                          src={config.profileImage}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover border-4 border-white/90 dark:border-slate-700/90 shadow-2xl shadow-slate-900/15 dark:shadow-slate-900/40 transition-all duration-500 ease-out group-hover:scale-[1.01] group-hover:shadow-3xl group-hover:border-white dark:group-hover:border-slate-600/90"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border-4 border-white/90 dark:border-slate-700/90 shadow-2xl shadow-slate-900/15 dark:shadow-slate-900/40 flex items-center justify-center">
                          <svg className="w-20 h-20 lg:w-24 lg:h-24 text-slate-400 dark:text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}

                      {!isView && (
                        <>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/70 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <span className="text-sm font-semibold">Update Photo</span>
                            <span className="text-xs text-white/80">PNG, JPG up to 2MB</span>
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={onImageUpload}
                          />
                          <button
                            type="button"
                            onClick={() => onValueChange('profileImage', initialPlaceholderImage)}
                            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-slate-600 shadow-md border border-white/30 hover:bg-white"
                          >
                            Remove photo
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleMembersLoungeClick}
                disabled={!loungeVisible}
                className={`group inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  loungeVisible
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-purple-500/40 focus:ring-indigo-400'
                    : 'bg-slate-200/90 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 cursor-not-allowed focus:ring-slate-300/60'
                }`}
              >
                <span>{loungeVisible ? 'Explore Members Club' : 'Enable Members Club Section'}</span>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                    loungeVisible ? 'bg-white/20' : 'bg-white/40 dark:bg-slate-600/50'
                  }`}
                >
                  <svg
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${
                      loungeVisible ? 'group-hover:translate-x-0.5' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
              {!loungeVisible && (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">
                  Turn on the Members Lounge section in the left panel to make it visible on your page.
                </p>
              )}
            </div>

            <div className="flex-1 text-center lg:text-left space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-white/70 dark:bg-slate-800/70 border border-white/50 shadow-sm text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  {renderTextField('title', 'Wellness Professional', 'uppercase tracking-[0.3em] text-xs font-semibold text-slate-500 dark:text-slate-400')}
                </div>

                <div className="space-y-4">
                  {renderTextField(
                    'name',
                    'Your full name',
                    `${config.styles.fontHeading} text-4xl lg:text-5xl font-bold text-slate-800 dark:text-white`,
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-6 py-4">
                    <div className="w-5 h-5 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    {renderContactField(
                      'email',
                      config.email || '',
                      'Email not provided',
                      'flex-1 text-slate-700 dark:text-slate-300 text-sm font-medium tracking-wide',
                    )}
                  </div>

                  <div className="flex items-center gap-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-6 py-4">
                    <div className="w-5 h-5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    {renderContactField(
                      'tel',
                      config.phone || '',
                      'Phone not provided',
                      'flex-1 text-slate-700 dark:text-slate-300 text-sm font-medium tracking-wide',
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="absolute top-8 right-8 opacity-10 pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
              <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 animate-pulse delay-100" />
              <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600 animate-pulse delay-200" />
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  );
};

export default ProfileHeader;
