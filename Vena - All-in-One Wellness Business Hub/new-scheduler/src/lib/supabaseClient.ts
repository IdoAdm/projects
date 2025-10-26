import { createClient } from '@supabase/supabase-js';

// For Vite, use VITE_ prefix instead of REACT_APP_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Add validation to see what's wrong
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
