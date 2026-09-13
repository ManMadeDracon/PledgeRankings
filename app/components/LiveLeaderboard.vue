<script setup lang="ts">
import type { Person } from '~/composables/useLeaderboard'

defineProps<{
  people: Person[]
  pending?: boolean
}>()
</script>

<template>
  <GlassCard title="🏆 Live Leaderboard">
    <p v-if="pending" class="py-4 text-center text-[14px] text-ink">
      Loading rankings…
    </p>

    <p v-else-if="!people.length" class="py-4 text-center text-[14px] text-ink">
      No one on the board yet.
    </p>

    <div v-else>
      <LeaderboardItem
        v-for="person in people"
        :key="person.id"
        :name="person.name"
        :points="person.points"
      />
    </div>
  </GlassCard>
</template>
