<script setup lang="ts">
import type { SystemSettings } from '~/composables/useApi'

const api = useApi()

const maxPoints = ref<number | null>(null)
const timeWindow = ref<number | null>(null)
const message = ref('')
const ok = ref(false)
const busy = ref(false)

async function load() {
  try {
    const res = await api.adminAction<{ success: true, settings: SystemSettings }>('get_settings')
    maxPoints.value = res.settings.max_points_limit
    timeWindow.value = res.settings.time_window_hours
  }
  catch (error) {
    ok.value = false
    message.value = apiErrorMessage(error)
  }
}

async function onSubmit() {
  busy.value = true
  message.value = ''
  try {
    await api.adminAction('update_settings', {
      max_points_limit: maxPoints.value,
      time_window_hours: timeWindow.value,
    })
    ok.value = true
    message.value = 'Rate limit settings updated.'
  }
  catch (error) {
    ok.value = false
    message.value = apiErrorMessage(error)
  }
  finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<template>
  <GlassCard title="⚙️ Rate Limits">
    <p class="mb-4 rounded-xl bg-white/40 p-3 text-[13px] text-ink-strong">
      <template v-if="maxPoints !== null && timeWindow !== null">
        Standard users can adjust up to <strong>{{ maxPoints }} points</strong>
        every <strong>{{ timeWindow }} hour(s)</strong>.
      </template>
      <template v-else>
        Loading current active limit…
      </template>
    </p>

    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <div class="flex flex-col gap-1">
        <label for="maxPoints" class="field-label">Max points per window</label>
        <input
          id="maxPoints"
          v-model.number="maxPoints"
          type="number"
          min="1"
          required
          class="glass-input"
        >
      </div>

      <div class="flex flex-col gap-1">
        <label for="timeWindow" class="field-label">Time window (hours)</label>
        <input
          id="timeWindow"
          v-model.number="timeWindow"
          type="number"
          step="0.1"
          min="0.1"
          required
          class="glass-input"
        >
      </div>

      <button type="submit" class="glass-btn" :disabled="busy">
        {{ busy ? 'Saving…' : 'Save Settings' }}
      </button>

      <p
        v-if="message"
        class="text-center text-[13px]"
        :class="ok ? 'text-points-up' : 'text-points-down'"
      >
        {{ message }}
      </p>
    </form>
  </GlassCard>
</template>
