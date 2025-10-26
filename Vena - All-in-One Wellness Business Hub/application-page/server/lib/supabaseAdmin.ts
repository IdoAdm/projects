import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
// Service-role key is required to access tables with elevated policies from the server.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client: SupabaseClient | null = null;

if (!supabaseUrl) {
  console.warn('[supabase-admin] Missing SUPABASE_URL or VITE_SUPABASE_URL environment variable.');
} else if (!supabaseServiceKey) {
  console.warn('[supabase-admin] Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
} else {
  client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabaseAdmin = client;
