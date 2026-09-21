import { createClient } from '@supabase/supabase-js'

// Type assertion for Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
