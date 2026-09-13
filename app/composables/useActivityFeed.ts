export interface FeedItem {
  id: number
  names: string
  points: number
  reason: string | null
  description: string | null
}

interface TipLogRow {
  id: number
  person_ids: number[] | null
  points_changed: number
  reason: string | null
  description: string | null
}

export function formatNames(names: string[]): string {
  if (names.length === 0) return 'Someone'
  if (names.length === 1) return names[0]!
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`
}

export function useActivityFeed(nameById: Ref<Map<number, string>>) {
  const supabase = useSupabase()

  const { data, pending, refresh } = useAsyncData<TipLogRow[]>(
    'activity-feed',
    async () => {
      const { data, error } = await supabase
        .from('tip_logs')
        .select('id, person_ids, points_changed, reason, description')
        .eq('is_undone', false)
        // Direct admin adjustments stay out of the public feed.
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(15)
      if (error) throw new Error(error.message)
      return (data ?? []) as TipLogRow[]
    },
    { default: () => [] },
  )

  const items = computed<FeedItem[]>(() =>
    (data.value ?? []).map(log => ({
      id: log.id,
      names: formatNames(
        (log.person_ids ?? []).map(id => nameById.value.get(id) ?? 'Someone'),
      ),
      points: log.points_changed,
      reason: log.reason,
      description: log.description,
    })),
  )

  return { items, pending, refresh }
}
