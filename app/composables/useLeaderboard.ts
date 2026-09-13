export interface Person {
  id: number
  name: string
  points: number
}

export function useLeaderboard() {
  const supabase = useSupabase()

  const { data, pending, refresh } = useAsyncData<Person[]>(
    'leaderboard',
    async () => {
      const { data, error } = await supabase
        .from('rankings')
        .select('id, name, points')
        .order('points', { ascending: false })
      if (error) throw new Error(error.message)
      return (data ?? []) as Person[]
    },
    { default: () => [] },
  )

  const people = computed(() => data.value ?? [])

  const nameById = computed(() => {
    const map = new Map<number, string>()
    for (const person of people.value) map.set(person.id, person.name)
    return map
  })

  return { people, nameById, pending, refresh }
}
