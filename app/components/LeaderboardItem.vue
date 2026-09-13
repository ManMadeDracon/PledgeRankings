<script setup lang="ts">
defineProps<{
  name: string
  points: number
}>()
</script>

<template>
  <div class="rule-divider flex items-start justify-between gap-3 p-[10px] text-[14px] text-black">
    <span class="min-w-0 break-words">{{ name }}</span>
    <span class="shrink-0 whitespace-nowrap">{{ points }} PTs</span>
  </div>
</template>
