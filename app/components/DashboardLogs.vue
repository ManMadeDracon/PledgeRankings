<script setup lang="ts">
const props = defineProps<{ nameById: Map<number, string> }>()
const emit = defineEmits<{ changed: [] }>()

interface LogRow {
  id: number
  created_at: string
  user_email: string | null
  person_ids: number[] | null
  points_changed: number
  reason: string | null
  description: string | null
  is_undone: boolean
  is_public: boolean
}

const PAGE_SIZE = 10

const supabase = useSupabase()
const api = useApi()

const logs = ref<LogRow[]>([])
const hasMore = ref(true)
const loading = ref(false)
const message = ref('')

async function loadMore(reset = false) {
  if (loading.value) return
  if (reset) {
    logs.value = []
    hasMore.value = true
  }
  if (!hasMore.value) return

  loading.value = true
  const from = logs.value.length
  const { data, error } = await supabase
    .from('tip_logs')
    .select('id, created_at, user_email, person_ids, points_changed, reason, description, is_undone, is_public')
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (error) {
    message.value = error.message
    hasMore.value = false
  }
  else {
    logs.value.push(...(data as LogRow[]))
    if (!data || data.length < PAGE_SIZE) hasMore.value = false
  }
  loading.value = false
}

function recipients(log: LogRow) {
  return (log.person_ids ?? []).map(id => props.nameById.get(id) ?? 'Unknown').join(', ')
}

function formatTime(value: string) {
  return new Date(value).toLocaleString()
}

async function undo(logId: number) {
  message.value = ''
  try {
    await api.adminAction('undo_tip', { logId })
    emit('changed')
    await loadMore(true)
  }
  catch (error) {
    message.value = apiErrorMessage(error)
  }
}

defineExpose({ reload: () => loadMore(true) })

onMounted(() => loadMore(true))
</script>

<template>
  <GlassCard title="📜 Tip Logs">
    <ul class="flex flex-col gap-2">
      <li
        v-for="log in logs"
        :key="log.id"
        class="rounded-xl bg-white/35 p-3"
        :class="log.is_undone ? 'opacity-55' : ''"
      >
        <div class="flex items-baseline justify-between gap-2">
          <strong class="min-w-0 break-words text-[14px] text-ink-strong">
            {{ recipients(log) || '—' }}
          </strong>
          <span
            class="shrink-0 text-[14px]"
            :class="log.points_changed >= 0 ? 'text-points-up' : 'text-points-down'"
          >
            {{ log.points_changed > 0 ? '+' : '' }}{{ log.points_changed }}
          </span>
        </div>

        <p v-if="log.reason" class="mt-1 text-[12px] text-ink">
          Reason: <span class="text-ink-strong">{{ log.reason }}</span>
        </p>
        <p v-if="log.description" class="text-[11px] text-ink-strong">
          {{ log.description }}
        </p>

        <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span class="text-[11px] text-ink">
            {{ formatTime(log.created_at) }} · {{ log.user_email || 'System' }}
            <template v-if="!log.is_public"> · private</template>
          </span>
          <span v-if="log.is_undone" class="text-[11px] text-ink">Undone</span>
          <button
            v-else
            type="button"
            class="glass-btn !min-h-0 !px-3 !py-1.5 !text-[12px]"
            @click="undo(log.id)"
          >
            Undo
          </button>
        </div>
      </li>
    </ul>

    <p v-if="!logs.length && !loading" class="py-3 text-center text-[13px] text-ink">
      No logs yet.
    </p>

    <button
      v-if="hasMore"
      type="button"
      class="glass-btn mt-3 w-full"
      :disabled="loading"
      @click="loadMore()"
    >
      {{ loading ? 'Loading…' : 'Load more' }}
    </button>

    <p v-if="message" class="mt-3 text-center text-[13px] text-points-down">
      {{ message }}
    </p>
  </GlassCard>
</template>
