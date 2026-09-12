import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get config from import.meta.env or localStorage (allow setting directly in UI)
export function getSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem('eosis_supabase_url') || '';
  const storedKey = localStorage.getItem('eosis_supabase_anon_key') || '';

  return {
    url: storedUrl || envUrl,
    anonKey: storedKey || envKey,
  };
}

let supabaseInstance: SupabaseClient | null = null;

export function initSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (config.url && config.anonKey && config.url.startsWith('http')) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return null;
}

export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey && config.url.startsWith('http'));
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem('eosis_supabase_url', url.trim());
  localStorage.setItem('eosis_supabase_anon_key', anonKey.trim());
  supabaseInstance = null; // reset to force re-init
  return initSupabaseClient();
}

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    supabaseInstance = initSupabaseClient();
  }
  return supabaseInstance;
}
