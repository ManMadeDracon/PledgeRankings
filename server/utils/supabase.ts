import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

let client: SupabaseClient | null = null

/** Service-role client. Never expose this key or its results to the browser raw. */
export function serviceClient(): SupabaseClient {
  if (!client) {
    const config = useRuntimeConfig()
    if (!config.supabaseServiceRoleKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'SUPABASE_SERVICE_ROLE_KEY is not configured',
      })
    }
    client = createClient(config.public.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return client
}

export async function requireUser(event: H3Event) {
  const header = getHeader(event, 'authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Missing token' })

  const supabase = serviceClient()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  return { supabase, user: data.user }
}

export async function requireSuperuser(event: H3Event) {
  const { supabase, user } = await requireUser(event)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superuser') {
    throw createError({ statusCode: 403, statusMessage: 'Superuser access required' })
  }

  return { supabase, user }
}
