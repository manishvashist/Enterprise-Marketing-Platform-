import { createClient } from '@supabase/supabase-js';

// --- IMPORTANT SETUP ---
// Environment variables should be used to store your Supabase credentials.
// These are typically set in a .env file locally or in your deployment service's settings.
// 1. SUPABASE_URL: Your project's "Project URL".
// 2. SUPABASE_ANON_KEY: Your project's "anon" "public" key.
// 3. IMPORTANT: Go to "Authentication" > "Providers" and enable Email. Disable "Confirm email" for easier testing.
// 4. Go to the "SQL Editor" in your project and run the setup SQL from the app's setup screen to create your database tables.

const supabaseUrl = "https://nrowevlicvigibnormgz.supabase.co";
const supabaseAnonKey = "sb_publishable_O3BmQJmLkyvKX2nDIF3Q0g_YkUj6NZ-";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

// Export null if not configured. The app must handle this case.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
