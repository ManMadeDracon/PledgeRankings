export default defineEventHandler(async (event) => {
  const { supabase, user: admin } = await requireSuperuser(event)

  const { action, payload = {} } = await readBody<{
    action?: string
    payload?: Record<string, never>
  }>(event)

  const data = payload as Record<string, string | number | undefined>

  if (action === 'get_settings') {
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 1)
      .single()
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { success: true as const, settings }
  }

  if (action === 'update_settings') {
    const { error } = await supabase
      .from('system_settings')
      .update({
        max_points_limit: Number.parseInt(String(data.max_points_limit), 10),
        time_window_hours: Number.parseFloat(String(data.time_window_hours)),
      })
      .eq('id', 1)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { success: true as const, message: 'Settings updated' }
  }

  if (action === 'undo_tip') {
    const { error } = await supabase.rpc('undo_tip', { p_log_id: data.logId })
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { success: true as const, message: 'Tip undone' }
  }

  if (action === 'add_person') {
    const { error } = await supabase.from('rankings').insert([{ name: data.name, points: 0 }])
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { success: true as const, message: 'Person added' }
  }

  if (action === 'remove_person') {
    const { error } = await supabase.from('rankings').delete().eq('id', data.personId)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { success: true as const, message: 'Person removed' }
  }

  if (action === 'rename_person') {
    const { error } = await supabase
      .from('rankings')
      .update({ name: data.newName })
      .eq('id', data.personId)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { success: true as const, message: 'Person renamed' }
  }

  if (action === 'adjust_points_direct') {
    const delta = Number.parseInt(String(data.pointsDelta), 10)
    const personId = Number.parseInt(String(data.personId), 10)

    const { data: person } = await supabase
      .from('rankings')
      .select('points')
      .eq('id', personId)
      .single()

    const { error: updateError } = await supabase
      .from('rankings')
      .update({ points: (person?.points ?? 0) + delta })
      .eq('id', personId)
    if (updateError) throw createError({ statusCode: 500, statusMessage: updateError.message })

    const { error: logError } = await supabase.from('tip_logs').insert([{
      user_id: admin.id,
      user_email: admin.email,
      person_ids: [personId],
      points_changed: delta,
      reason: data.reason || 'Direct Admin Adjustment',
      description: 'Direct point change via superuser panel',
      is_public: false,
    }])
    if (logError) throw createError({ statusCode: 500, statusMessage: logError.message })

    return { success: true as const, message: 'Points adjusted' }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid action' })
})
