<script setup lang="ts">
import type { RealtimeChannel } from '@supabase/supabase-js'

const supabase = useSupabase()
const { session } = useAuth()

const { people, nameById, pending: peoplePending, refresh: refreshPeople } = useLeaderboard()
const { items, pending: feedPending, refresh: refreshFeed } = useActivityFeed(nameById)

let channel: RealtimeChannel | null = null

onMounted(() => {
  channel = supabase
    .channel('realtime-index')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rankings' },
      () => { refreshPeople() },
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tip_logs' },
      () => { refreshFeed() },
    )
    .subscribe()
})

onBeforeUnmount(() => {
  if (channel) supabase.removeChannel(channel)
})
</script>

<template>
  <main class="mx-auto w-full max-w-[430px] px-5 pt-6 pb-16 lg:max-w-5xl lg:pt-10">
    <div class="mb-4 flex justify-end">
      <NuxtLink :to="session ? '/dashboard' : '/login'" class="glass-btn text-[13px]">
        {{ session ? '⚡ Dashboard' : '🔒 Dashboard Login' }}
      </NuxtLink>
    </div>

    <div class="flex flex-col gap-[30px] lg:grid lg:grid-cols-2 lg:items-start">
      <LiveLeaderboard :people="people" :pending="peoplePending" />
      <RecentActivityBoard :items="items" :pending="feedPending" />
    </div>
  </main>
</template>
