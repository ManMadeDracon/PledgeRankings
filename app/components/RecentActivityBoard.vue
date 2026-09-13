<script setup lang="ts">
import type { FeedItem } from '~/composables/useActivityFeed'

defineProps<{
  items: FeedItem[]
  pending?: boolean
}>()
</script>

<template>
  <GlassCard title="🔊 Recent Activity">
    <p v-if="pending" class="py-4 text-center text-[14px] text-ink">
      Loading feed…
    </p>

    <p v-else-if="!items.length" class="py-4 text-center text-[14px] text-ink">
      No recent activity.
    </p>

    <div v-else class="flex flex-col">
      <ActivityBoardItem
        v-for="item in items"
        :key="item.id"
        :names="item.names"
        :points="item.points"
        :reason="item.reason"
        :description="item.description"
      />
    </div>
  </GlassCard>
</template>
