<script setup lang="ts">
const props = defineProps<{
  names: string
  points: number
  reason?: string | null
  description?: string | null
}>()

const isGain = computed(() => props.points >= 0)
const pointsLabel = computed(
  () => `${isGain.value ? '+' : '−'} ${Math.abs(props.points)} PTS`,
)
</script>

<template>
  <article class="flex flex-col gap-[5px] py-[5px]">
    <div
      class="flex items-baseline justify-between gap-2 pr-[10px]"
      :class="isGain ? 'text-points-up' : 'text-points-down'"
    >
      <p class="min-w-0 flex-1 break-words text-[14px]">
        {{ names }}
      </p>
      <p class="shrink-0 whitespace-nowrap text-[16px]">
        {{ pointsLabel }}
      </p>
    </div>

    <p v-if="reason" class="text-[12px] text-ink">
      Reason: <span class="text-ink-strong">{{ reason }}</span>
    </p>

    <p v-if="description" class="text-[11px] leading-snug text-ink-strong">
      {{ description }}
    </p>
  </article>
</template>
