export default defineEventHandler(async (event) => {
  const { supabase } = await requireSuperuser(event)

  const { action, email, password, role, userId } = await readBody<{
    action?: string
    email?: string
    password?: string
    role?: string
    userId?: string
  }>(event)

  if (action === 'create_user') {
    if (!email || !password) {
      throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })

    if (role === 'superuser') {
      await supabase.from('profiles').update({ role: 'superuser' }).eq('id', data.user.id)
    }
    return { success: true as const }
  }

  if (action === 'update_role') {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { success: true as const }
  }

  if (action === 'delete_user') {
    if (!userId) throw createError({ statusCode: 400, statusMessage: 'userId is required' })
    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { success: true as const }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid action' })
})
