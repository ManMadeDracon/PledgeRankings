export default defineEventHandler(async (event) => {
  const { supabase, user } = await requireUser(event)

  const { personIds, points, reason, description } = await readBody<{
    personIds?: Array<number | string>
    points?: number | string
    reason?: string
    description?: string
  }>(event)

  if (!Array.isArray(personIds) || personIds.length === 0 || !points) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const { error } = await supabase.rpc('submit_tip', {
    p_user_id: user.id,
    p_user_email: user.email,
    p_person_ids: personIds.map(id => Number.parseInt(String(id), 10)),
    p_points: Number.parseInt(String(points), 10),
    p_reason: reason || '',
    p_description: description || '',
  })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { success: true as const }
})
