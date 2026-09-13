import type { Session } from '@supabase/supabase-js'

export type Role = 'standard' | 'superuser'

export function useAuth() {
  const supabase = useSupabase()

  const session = useState<Session | null>('auth:session', () => null)
  const role = useState<Role>('auth:role', () => 'standard')
  const ready = useState<boolean>('auth:ready', () => false)

  const user = computed(() => session.value?.user ?? null)
  const token = computed(() => session.value?.access_token ?? null)
  const isSuperuser = computed(() => role.value === 'superuser')

  async function loadRole() {
    if (!session.value) {
      role.value = 'standard'
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.value.user.id)
      .single()
    role.value = (data?.role as Role) ?? 'standard'
  }

  async function init() {
    if (ready.value) return
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    await loadRole()
    ready.value = true

    supabase.auth.onAuthStateChange(async (_event, next) => {
      session.value = next
      await loadRole()
    })
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    session.value = data.session
    await loadRole()
  }

  async function signOut() {
    await supabase.auth.signOut()
    session.value = null
    role.value = 'standard'
  }

  return { session, user, token, role, isSuperuser, ready, init, signIn, signOut }
}
