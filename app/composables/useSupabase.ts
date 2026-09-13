import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function useSupabase(): SupabaseClient {
  if (!client) {
    const config = useRuntimeConfig()
    client = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey, {
      auth: {
        // There is no storage to persist into during SSR.
        persistSession: import.meta.client,
        autoRefreshToken: import.meta.client,
        detectSessionInUrl: false,
      },
    })
  }
  return client
}
