import { createClient } from '@supabase/supabase-js';

const defaultSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const defaultSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export function getSupabaseClient(customUrl?: string, customKey?: string) {
  const url = customUrl || defaultSupabaseUrl;
  const key = customKey || defaultSupabaseAnonKey;

  try {
    return createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (error) {
    console.warn('Supabase client init fallback:', error);
    return null;
  }
}

export const supabase = getSupabaseClient();
