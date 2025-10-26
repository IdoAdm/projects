// application-page/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl ? 'SET' : 'NOT SET',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'SET' : 'NOT SET'
  });
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Store session in localStorage for better cross-origin support
    storageKey: 'vena-auth-token',
    storage: window.localStorage,
    flowType: 'pkce',
    // Set debug mode in development
    debug: import.meta.env.DEV
  },
  global: {
    headers: {
      'X-Client-Info': 'vena-application'
    }
  }
});

// Log configuration on startup (sanitized)
console.log(
  '[Supabase Client] Initialized:',
  (supabaseUrl || '').replace(/(https:\/\/)(.*?)(\.supabase\.co)/, '$1***$3'),
  'Key:', (supabaseAnonKey || '').slice(0, 8) + '...'
);
