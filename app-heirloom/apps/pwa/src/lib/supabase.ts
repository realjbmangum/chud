import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    env: import.meta.env
  });
  throw new Error('Missing Supabase environment variables. Check Cloudflare Pages env vars.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
        };
      };
      stories: {
        Row: {
          id: string;
          vault_id: string;
          created_by: string;
          title: string | null;
          media_type: 'audio' | 'video' | 'photo';
          media_url: string;
          thumbnail_url: string | null;
          duration_seconds: number | null;
          transcript: string | null;
          category: string | null;
          prompt_id: string | null;
          recorded_at: string;
          created_at: string;
          is_shared_to_family: boolean;
        };
        Insert: {
          vault_id: string;
          created_by: string;
          title?: string | null;
          media_type: 'audio' | 'video' | 'photo';
          media_url: string;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          category?: string | null;
          prompt_id?: string | null;
        };
      };
      prompts: {
        Row: {
          id: string;
          text: string;
          category: string | null;
          is_active: boolean;
          created_at: string;
        };
      };
      vaults: {
        Row: {
          id: string;
          type: 'personal' | 'family';
          owner_user_id: string | null;
          owner_family_id: string | null;
          created_at: string;
        };
      };
    };
  };
};
