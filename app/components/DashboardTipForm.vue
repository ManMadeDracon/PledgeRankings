<script setup lang="ts">
import type { Person } from '~/composables/useLeaderboard'
import type { UserLimits } from '~/composables/useApi'

const props = defineProps<{ people: Person[] }>()
const emit = defineEmits<{ changed: [] }>()

const api = useApi()

const limits = ref<UserLimits | null>(null)
const selected = ref<number[]>([])
const points = ref<number | null>(null)
const reason = ref('')
const description = ref('')
const message = ref('')
const ok = ref(false)
const busy = ref(false)

async function loadLimits() {
  try {
    limits.value = await api.getUserLimits()
  }
  catch (err) {
    console.error('Failed to load user limits:', err)
  }
}

const sorted = computed(() =>
  [...props.people].sort((a, b) => a.name.localeCompare(b.name)),
)

function toggle(id: number) {
  const index = selected.value.indexOf(id)
  if (index === -1) selected.value.push(id)
  else selected.value.splice(index, 1)
}

async function onSubmit() {
  if (!selected.value.length || !points.value) {
    ok.value = false
    message.value = 'Pick at least one person and a point value.'
    return
  }

  busy.value = true
  message.value = ''
  try {
    await api.submitTip({
      personIds: selected.value,
      points: points.value,
      reason: reason.value,
      description: description.value,
    })
    ok.value = true
    message.value = 'Points updated successfully!'
    selected.value = []
    points.value = null
    reason.value = ''
    description.value = ''
    await loadLimits()
    emit('changed')
  }
  catch (error) {
    ok.value = false
    message.value = apiErrorMessage(error)
  }
  finally {
    busy.value = false
  }
}

onMounted(loadLimits)
</script>

<template>
  <GlassCard title="⚡ Submit Tip">
    <!-- Point Limits Summary -->
    <div v-if="limits" class="mb-4 flex gap-3 text-center text-[12px]">
      <div class="flex-1 rounded-xl bg-white/40 p-2.5">
        <span class="block text-ink font-medium">Point Limit</span>
        <strong class="text-[15px] text-ink-strong">{{ limits.maxPoints }} PTS</strong>
      </div>
      <div class="flex-1 rounded-xl bg-white/40 p-2.5">
        <span class="block text-ink font-medium">Points Left</span>
        <strong
          class="text-[15px]"
          :class="limits.pointsLeft > 0 ? 'text-points-up' : 'text-points-down'"
        >
          {{ limits.pointsLeft }} PTS
        </strong>
      </div>
    </div>

    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <fieldset class="flex flex-col gap-2">
        <legend class="field-label mb-2">
          Who gets the points?
        </legend>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="person in sorted"
            :key="person.id"
            type="button"
            class="glass-btn !min-h-0 !px-3 !py-2 !text-[13px]"
            :class="selected.includes(person.id) ? '!bg-white/85 !border-white ring-2 ring-[#7b9cc7]' : ''"
            :aria-pressed="selected.includes(person.id)"
            @click="toggle(person.id)"
          >
            {{ person.name }} ({{ person.points }})
          </button>
        </div>
        <p v-if="!sorted.length" class="text-[13px] text-ink">
          No people yet — add some below.
        </p>
      </fieldset>

      <div class="flex flex-col gap-1">
        <label for="points" class="field-label">Points (tap +/− to add or subtract)</label>
        <PointsInput
          id="points"
          v-model="points"
          required
          placeholder="e.g. 10"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="reason" class="field-label">Reason</label>
        <input
          id="reason"
          v-model="reason"
          type="text"
          class="glass-input"
          placeholder="e.g. Great presentation"
        >
      </div>

      <div class="flex flex-col gap-1">
        <label for="description" class="field-label">Description</label>
        <textarea
          id="description"
          v-model="description"
          rows="3"
          class="glass-input"
          placeholder="Additional details…"
        />
      </div>

      <button type="submit" class="glass-btn" :disabled="busy">
        {{ busy ? 'Submitting…' : 'Submit Points' }}
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