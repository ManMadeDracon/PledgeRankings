export default defineEventHandler(async (event) => {
  const { supabase, user } = await requireUser(event)

  // Fetch global default settings
  const { data: settings } = await supabase
    .from('system_settings')
    .select('max_points_limit, time_window_hours')
    .eq('id', 1)
    .single()

  const defaultMax = settings?.max_points_limit ?? 100
  const windowHours = settings?.time_window_hours ?? 24

  // Check if profile has a custom point_limit override
  const { data: profile } = await supabase
    .from('profiles')
    .select('point_limit')
    .eq('id', user.id)
    .single()

  const maxPoints = profile?.point_limit ?? defaultMax

  // Fetch points spent by the user within the rolling time window
  const windowStart = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString()

  const { data: logs, error } = await supabase
    .from('tip_logs')
    .select('person_ids, points_changed')
    .eq('user_id', user.id)
    .eq('is_undone', false)
    .gte('created_at', windowStart)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const pointsUsed = (logs || []).reduce((sum, log) => {
    const recipients = log.person_ids?.length || 1
    return sum + Math.abs(log.points_changed) * recipients
  }, 0)

  return {
    maxPoints,
    pointsUsed,
    pointsLeft: Math.max(0, maxPoints - pointsUsed),
    timeWindowHours: windowHours,
  }
})