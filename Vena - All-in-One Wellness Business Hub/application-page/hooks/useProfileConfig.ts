import { useState, useEffect } from 'react';
import { getInitialConfig, TEMPLATES } from '../constants/config';
import { FONT_THEMES } from '../constants/themes';
import { supabase } from '../lib/supabaseClient';
import { ProfileConfig, SectionId, FontThemeKey, LandingPageMeta } from '../index';

export type DataStatus = 'idle' | 'loading' | 'saving' | 'success' | 'error';
export type PublishStatus = 'idle' | 'publishing' | 'success' | 'error';

const slugify = (raw: string) => raw
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');



export const useProfileConfig = (language: 'en' | 'he' = 'en') => {
  const [config, setConfig] = useState<ProfileConfig>(() => getInitialConfig(language));
  const [status, setStatus] = useState<DataStatus>('loading');
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('idle');
  const [publishError, setPublishError] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      setStatus('loading');
      console.log('DIAGNOSTIC: Attempting to fetch profile...');
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error("DIAGNOSTIC: No user is logged in. Cannot fetch profile. Using initial config.");
          setConfig(getInitialConfig(language));
          setStatus('idle');
          return;
        }

        console.log('DIAGNOSTIC: Logged in user ID:', user.id);
        console.log('DIAGNOSTIC: Querying "registrations" table for user profile...');

        const { data, error } = await supabase
          .from('registrations')
          .select('profile_config, business_name')
          .eq('id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
            console.warn('DIAGNOSTIC: Supabase query returned no rows (PGRST116). This is normal for a new user.');
        } else if (error) {
          console.error('DIAGNOSTIC: Supabase fetch error:', error);
          throw error;
        }

        setBusinessName(data?.business_name ?? '');
        if (data && data.profile_config) {
          console.log('DIAGNOSTIC: Profile data found and received from Supabase:', data.profile_config);
          const dbConfig = data.profile_config as Partial<ProfileConfig>;
          
          setConfig((prevConfig: ProfileConfig) => {
            const incomingLounge = dbConfig.lounge;
            const baseLounge = prevConfig.lounge ?? getInitialConfig(language).lounge;
            const nextLounge = (() => {
              if (!incomingLounge) {
                return {
                  ...baseLounge,
                  posts: baseLounge.posts.map((post) => ({ ...post })),
                };
              }

              const posts = Array.isArray(incomingLounge.posts)
                ? incomingLounge.posts.map((post) => ({ ...post }))
                : baseLounge.posts.map((post) => ({ ...post }));

              return {
                ...baseLounge,
                ...incomingLounge,
                posts,
              };
            })();

            const newConfig = {
              ...prevConfig,
              ...dbConfig,
              styles: {
                ...prevConfig.styles,
                ...(dbConfig.styles || {}),
              },
              sectionVisibility: {
                ...prevConfig.sectionVisibility,
                ...(dbConfig.sectionVisibility || {}),
              },
              lounge: nextLounge,
              sections: dbConfig.sections && dbConfig.sections.length > 0 ? dbConfig.sections : prevConfig.sections,
              services: dbConfig.services && dbConfig.services.length > 0 ? dbConfig.services : prevConfig.services,
            };
            return newConfig;
          });
        } else {
          console.log('DIAGNOSTIC: No profile_config found in DB for this user. Using initial config.');
          setConfig(getInitialConfig(language));
        }
        setStatus('idle');
        setPublishStatus('idle');
        setPublishError(null);
      } catch (error) {
        console.error('DIAGNOSTIC: An unexpected error occurred in fetchProfile:', error);
        setStatus('error');
        setConfig(getInitialConfig(language));
      }
    };

    fetchProfile();
  }, [language]);

  const handleTemplateChange = (templateKey: string) => {
    if (templateKey === 'scratch') {
      setConfig(getInitialConfig(language));
    } else {
      const template = TEMPLATES[templateKey];
      if (template) {
        setConfig(prev => ({
          ...prev,
          ...template,
          styles: {
            ...prev.styles,
            ...(template.styles || {}),
          },
          templateId: templateKey,
        }));
      }
    }
  };

  const handleStyleChange = <K extends keyof ProfileConfig['styles']>(
    key: K,
    value: ProfileConfig['styles'][K]
  ) => {
    setConfig((prev: ProfileConfig) => ({ ...prev, styles: { ...prev.styles, [key]: value } }));
  };

  const handleFontThemeChange = (themeKey: FontThemeKey) => {
    const theme = FONT_THEMES[themeKey as keyof typeof FONT_THEMES];
    setConfig((prev: ProfileConfig) => ({
      ...prev,
      styles: { ...prev.styles, fontPairing: themeKey, fontHeading: theme.heading, fontBody: theme.body },
    }));
  };

  const handleValueChange = <K extends keyof ProfileConfig>(key: K, value: ProfileConfig[K]) => {
    setConfig((prev: ProfileConfig) => ({ ...prev, [key]: value }));
  };

  const handleSectionVisibilityChange = (sectionId: SectionId, isVisible: boolean) => {
    setConfig((prev: ProfileConfig) => ({
      ...prev,
      sectionVisibility: { ...prev.sectionVisibility, [sectionId]: isVisible },
    }));
  };

  const handleSectionsOrderChange = (sections: SectionId[]) => {
    setConfig((prev: ProfileConfig) => ({ ...prev, sections }));
  };

  const saveProfile = async () => {
    setStatus('saving');
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be logged in to save your profile.');
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
        return;
      }

      const { error } = await supabase
        .from('registrations')
        .update({ profile_config: config })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };
  const publishProfile = async () => {
    setPublishError(null);
    setPublishStatus('publishing');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to publish your landing page.');
      }

      const fallbackSlug = `page-${user.id.slice(0, 8).toLowerCase()}`;
      const slugSources = [
        config.landingPage?.slug ?? '',
        businessName ?? '',
        config.name ?? '',
        user.email?.split('@')[0] ?? '',
      ];

      let baseSlug = '';
      for (const source of slugSources) {
        const trimmed = source.trim();
        if (!trimmed) continue;
        const slugCandidate = slugify(trimmed);
        if (slugCandidate) {
          baseSlug = slugCandidate;
          break;
        }
      }

      if (!baseSlug) {
        baseSlug = fallbackSlug;
      }

      let slugToUse = baseSlug;
      let attempt = 0;
      const maxAttempts = 25;

      while (attempt < maxAttempts) {
        const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
        const { data: existing, error: existingError } = await supabase
          .from('registrations')
          .select('id')
          .eq('profile_config->landingPage->>slug', candidate)
          .neq('id', user.id);

        if (existingError) {
          throw existingError;
        }

        if (!existing || existing.length === 0) {
          slugToUse = candidate;
          break;
        }

        attempt += 1;
      }

      if (attempt === maxAttempts) {
        throw new Error('Unable to reserve a unique landing page URL. Please try again or contact support.');
      }

      const isoNow = new Date().toISOString();
      const landingMeta: LandingPageMeta = {
        slug: slugToUse,
        published: true,
        publishedAt: config.landingPage?.publishedAt ?? isoNow,
        lastUpdatedAt: isoNow,
      };

      const payload: ProfileConfig = {
        ...config,
        landingPage: landingMeta,
      };

      const { error: updateError } = await supabase
        .from('registrations')
        .update({ profile_config: payload })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setConfig(payload);
      setPublishStatus('success');
      setTimeout(() => setPublishStatus('idle'), 2000);
    } catch (error: any) {
      console.error('Error publishing profile:', error);
      setPublishError(error?.message ?? 'Failed to publish landing page.');
      setPublishStatus('error');
      setTimeout(() => setPublishStatus('idle'), 3000);
    }
  };

  return {
    config,
    setConfig,
    status,
    publishStatus,
    publishError,
    businessName,
    saveProfile,
    publishProfile,
    handleTemplateChange,
    handleStyleChange,
    handleFontThemeChange,
    handleValueChange,
    handleSectionVisibilityChange,
    handleSectionsOrderChange,
  };
};





