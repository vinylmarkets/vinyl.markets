import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase Environment Check:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Loaded' : 'Missing');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Loaded' : 'Missing');

// Create client with fallback values to prevent crashes
// The AuthProvider will handle missing config gracefully
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)

// Export a function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const configured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co');
  console.log('Supabase configured:', configured);
  return configured;
}