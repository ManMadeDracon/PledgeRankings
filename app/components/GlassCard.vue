<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <section class="glass-card card-pad">
    <h2 v-if="title" class="glass-card-title mb-3">
      {{ title }}
    </h2>
    <slot />
  </section>
</template>

<style scoped>
/* Figma: pt 30 / pb 40 / px 34, tightened on narrow phones */
.card-pad {
  padding-block: 30px 40px;
  padding-inline: clamp(18px, 8.5vw, 34px);
}
</style>
