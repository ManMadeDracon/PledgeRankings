<script setup lang="ts">
import type { Person } from '~/composables/useLeaderboard'

const props = defineProps<{ people: Person[] }>()
const emit = defineEmits<{ changed: [] }>()

const api = useApi()

const newName = ref('')
const message = ref('')
const ok = ref(false)
const busy = ref(false)

const editingId = ref<number | null>(null)
const editName = ref('')

const adjustingId = ref<number | null>(null)
const adjustDelta = ref<number | null>(null)
const adjustReason = ref('')

const confirmRemoveId = ref<number | null>(null)

const sorted = computed(() =>
  [...props.people].sort((a, b) => a.name.localeCompare(b.name)),
)

async function run(fn: () => Promise<unknown>, success: string) {
  busy.value = true
  message.value = ''
  try {
    await fn()
    ok.value = true
    message.value = success
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

function startRename(person: Person) {
  adjustingId.value = null
  confirmRemoveId.value = null
  editingId.value = person.id
  editName.value = person.name
}

function startAdjust(person: Person) {
  editingId.value = null
  confirmRemoveId.value = null
  adjustingId.value = person.id
  adjustDelta.value = null
  adjustReason.value = ''
}

async function addPerson() {
  if (!newName.value.trim()) return
  await run(
    () => api.adminAction('add_person', { name: newName.value.trim() }),
    'Person added.',
  )
  newName.value = ''
}

async function saveRename(personId: number) {
  if (!editName.value.trim()) return
  await run(
    () => api.adminAction('rename_person', { personId, newName: editName.value.trim() }),
    'Person renamed.',
  )
  editingId.value = null
}

async function saveAdjust(personId: number) {
  if (!adjustDelta.value) return
  await run(
    () => api.adminAction('adjust_points_direct', {
      personId,
      pointsDelta: adjustDelta.value,
      reason: adjustReason.value || 'Direct Admin Adjustment',
    }),
    'Points adjusted.',
  )
  adjustingId.value = null
}

async function removePerson(personId: number) {
  await run(
    () => api.adminAction('remove_person', { personId }),
    'Person removed.',
  )
  confirmRemoveId.value = null
}
</script>

<template>
  <GlassCard title="👥 Manage People">
    <form class="mb-4 flex flex-col gap-2 sm:flex-row" @submit.prevent="addPerson">
      <input
        v-model="newName"
        type="text"
        required
        class="glass-input"
        placeholder="New person name"
      >
      <button type="submit" class="glass-btn shrink-0" :disabled="busy">
        Add
      </button>
    </form>

    <ul class="flex flex-col gap-2">
      <li
        v-for="person in sorted"
        :key="person.id"
        class="rounded-xl bg-white/35 p-3"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-[14px] text-ink-strong">
            <strong>{{ person.name }}</strong> · {{ person.points }} pts
          </span>

          <div class="flex flex-wrap gap-2">
            <button type="button" class="glass-btn !min-h-0 !px-3 !py-1.5 !text-[12px]" @click="startRename(person)">
              Rename
            </button>
            <button type="button" class="glass-btn !min-h-0 !px-3 !py-1.5 !text-[12px]" @click="startAdjust(person)">
              ± Points
            </button>
            <button
              type="button"
              class="glass-btn glass-btn-danger !min-h-0 !px-3 !py-1.5 !text-[12px]"
              @click="confirmRemoveId = confirmRemoveId === person.id ? null : person.id"
            >
              Remove
            </button>
          </div>
        </div>

        <div v-if="editingId === person.id" class="mt-3 flex flex-col gap-2 sm:flex-row">
          <input v-model="editName" type="text" class="glass-input" placeholder="New name">
          <div class="flex shrink-0 gap-2">
            <button type="button" class="glass-btn !min-h-0 !py-2" :disabled="busy" @click="saveRename(person.id)">
              Save
            </button>
            <button type="button" class="glass-btn !min-h-0 !py-2" @click="editingId = null">
              Cancel
            </button>
          </div>
        </div>

        <div v-if="adjustingId === person.id" class="mt-3 flex flex-col gap-2">
          <input
            v-model.number="adjustDelta"
            type="number"
            inputmode="numeric"
            class="glass-input"
            placeholder="Points to add (+) or subtract (−)"
          >
          <input v-model="adjustReason" type="text" class="glass-input" placeholder="Reason for admin log">
          <p class="text-[12px] text-ink">
            Direct changes are logged privately and stay out of the public feed.
          </p>
          <div class="flex gap-2">
            <button type="button" class="glass-btn !min-h-0 !py-2" :disabled="busy" @click="saveAdjust(person.id)">
              Apply
            </button>
            <button type="button" class="glass-btn !min-h-0 !py-2" @click="adjustingId = null">
              Cancel
            </button>
          </div>
        </div>

        <div v-if="confirmRemoveId === person.id" class="mt-3 flex flex-wrap items-center gap-2">
          <span class="text-[13px] text-points-down">Remove {{ person.name }} permanently?</span>
          <button
            type="button"
            class="glass-btn glass-btn-danger !min-h-0 !py-2"
            :disabled="busy"
            @click="removePerson(person.id)"
          >
            Yes, remove
          </button>
          <button type="button" class="glass-btn !min-h-0 !py-2" @click="confirmRemoveId = null">
            Cancel
          </button>
        </div>
      </li>
    </ul>

    <p
      v-if="message"
      class="mt-3 text-center text-[13px]"
      :class="ok ? 'text-points-up' : 'text-points-down'"
    >
      {{ message }}
    </p>
  </GlassCard>
</template>
