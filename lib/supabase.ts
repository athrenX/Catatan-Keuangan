import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Use placeholders during build time if environment variables are not yet set
const mockUrl = 'https://placeholder-project-id.supabase.co';
const mockKey = 'placeholder-anon-key';

export const supabase = createClient(
  supabaseUrl && supabaseUrl !== 'https://your-supabase-project.supabase.co' ? supabaseUrl : mockUrl,
  supabaseAnonKey && supabaseAnonKey !== 'your-supabase-anon-key' ? supabaseAnonKey : mockKey
);
