import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { supabase } from './lib/supabaseClient';
import { getInitialConfig } from './constants/config';
import type { ProfileConfig } from './index';
import PublishedLandingPage from './components/PublishedLandingPage';

const normalizeSlug = (input: string) => input.replace(/^\/+|\/+$/g, '').toLowerCase();

const apiOrigin = (import.meta.env.VITE_PUBLIC_API_ORIGIN || '').trim().replace(/\/+$/, '');
const buildLandingApiUrl = (slug: string) => {
  const encodedSlug = encodeURIComponent(slug);
  return apiOrigin ? `${apiOrigin}/api/landing/${encodedSlug}` : `/api/landing/${encodedSlug}`;
};

type ViewState = 'loading' | 'ready' | 'not-found' | 'error';

const mergeConfig = (base: ProfileConfig, incoming: Partial<ProfileConfig>): ProfileConfig => ({
  ...base,
  ...incoming,
  styles: {
    ...base.styles,
    ...(incoming.styles || {}),
  },
  sectionVisibility: {
    ...base.sectionVisibility,
    ...(incoming.sectionVisibility || {}),
  },
  lounge: (() => {
    const baseLounge = base.lounge;
    const incomingLounge = incoming.lounge;
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
  })(),
  sections: incoming.sections && incoming.sections.length > 0 ? incoming.sections : base.sections,
  services: incoming.services && incoming.services.length > 0 ? incoming.services : base.services,
  landingPage: incoming.landingPage ?? base.landingPage,
});

const LandingApp: React.FC = () => {
  const [status, setStatus] = useState<ViewState>('loading');
  const [config, setConfig] = useState<ProfileConfig | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const slug = useMemo(() => normalizeSlug(window.location.pathname), []);

  useEffect(() => {
    // Exclude reserved routes from landing page lookup
    const reservedRoutes = ['dashboard', 'scheduler', 'signin', 'login', 'register', 'api'];
    if (!slug || reservedRoutes.includes(slug)) {
      setStatus('not-found');
      return;
    }

    const loadFromApi = async (): Promise<boolean> => {
      try {
        const response = await fetch(buildLandingApiUrl(slug), {
          headers: { Accept: 'application/json' },
          credentials: 'omit',
        });

        if (response.status === 404) {
          setStatus('not-found');
          return true;
        }

        if (!response.ok) {
          console.warn('Landing API returned', response.status);
          return false;
        }

        const payload = await response.json().catch(() => null as any);
        if (!payload?.ok || !payload.profile) {
          setStatus('not-found');
          return true;
        }

        const merged = mergeConfig(getInitialConfig('en'), payload.profile as Partial<ProfileConfig>);
        if (!merged.landingPage?.published || merged.landingPage.slug?.toLowerCase() !== slug) {
          setStatus('not-found');
          return true;
        }

        setConfig(merged);
        setStatus('ready');
        return true;
      } catch (apiError) {
        console.warn('Landing API unavailable, falling back to Supabase.', apiError);
        return false;
      }
    };

    const loadFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('profile_config')
          .eq('profile_config->landingPage->>slug', slug)
          .eq('profile_config->landingPage->>published', 'true')
          .maybeSingle();

        if (error) {
          if ((error as any).code === 'PGRST116') {
            setStatus('not-found');
            return;
          }
          console.error('Error fetching landing page via Supabase:', error);
          setStatus('error');
          setErrorMessage('We could not load this landing page right now.');
          return;
        }

        if (!data || !data.profile_config) {
          setStatus('not-found');
          return;
        }

        const merged = mergeConfig(getInitialConfig('en'), data.profile_config as Partial<ProfileConfig>);

        if (!merged.landingPage?.published || merged.landingPage.slug?.toLowerCase() !== slug) {
          setStatus('not-found');
          return;
        }

        setConfig(merged);
        setStatus('ready');
      } catch (err) {
        console.error('Unexpected error loading landing page via Supabase', err);
        setStatus('error');
        setErrorMessage('We could not load this landing page right now.');
      }
    };

    const fetchLanding = async () => {
      setStatus('loading');
      setErrorMessage(null);

      const handledByApi = await loadFromApi();
      if (!handledByApi) {
        await loadFromSupabase();
      }
    };

    void fetchLanding();
  }, [slug]);

  useEffect(() => {
    if (config?.name) {
      document.title = `${config.name} | Vena`;
    }
  }, [config?.name]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600">
        <p>Loading landing page...</p>
      </div>
    );
  }

  if (status === 'not-found') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-slate-700 px-6 text-center">
        <h1 className="text-3xl font-semibold mb-3">We could not find that page</h1>
        <p className="text-slate-500 max-w-md">
          Double-check the link you received or reach out to the business owner for the latest landing page URL.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-slate-700 px-6 text-center">
        <h1 className="text-3xl font-semibold mb-3">Something went wrong</h1>
        <p className="text-slate-500 max-w-md">{errorMessage}</p>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  return <PublishedLandingPage config={config} />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <LandingApp />
  </React.StrictMode>
);
