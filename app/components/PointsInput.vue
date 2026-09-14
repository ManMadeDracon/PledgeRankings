<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: number | null
  id?: string
  placeholder?: string
  required?: boolean
}>(), { id: undefined, placeholder: undefined, required: false })

const emit = defineEmits<{ 'update:modelValue': [number | null] }>()

/*
 * Mobile numeric keypads (iOS especially) have no minus key, so the sign lives
 * in its own toggle button and the field itself only ever holds digits. A minus
 * typed or pasted on a desktop keyboard still works — it flips the toggle.
 */
const negative = ref(false)
const digits = ref('')

const current = computed(() => {
  if (digits.value === '') return null
  const magnitude = Number(digits.value)
  return negative.value ? -magnitude : magnitude
})

watch(() => props.modelValue, (value) => {
  if (value === current.value) return
  if (value === null || value === undefined || Number.isNaN(value)) {
    digits.value = ''
    negative.value = false
    return
  }
  negative.value = value < 0
  digits.value = String(Math.abs(value))
}, { immediate: true })

function onInput(event: Event) {
  const el = event.target as HTMLInputElement
  if (el.value.includes('-')) negative.value = true
  digits.value = el.value.replace(/\D/g, '')
  // Write the sanitised value back so stray characters never stick.
  el.value = digits.value
  emit('update:modelValue', current.value)
}

function toggleSign() {
  negative.value = !negative.value
  emit('update:modelValue', current.value)
}
</script>

<template>
  <div class="flex items-stretch gap-2">
    <button
      type="button"
      class="glass-btn shrink-0 !min-h-0 !w-14 !px-0 !py-2 !text-[18px]"
      :class="negative ? '!text-points-down !border-[rgba(255,47,47,0.5)] !bg-[rgba(255,47,47,0.14)]' : '!text-points-up'"
      :aria-pressed="negative"
      :aria-label="negative
        ? 'Points are negative. Activate to make them positive.'
        : 'Points are positive. Activate to make them negative.'"
      @click="toggleSign"
    >
      {{ negative ? '−' : '+' }}
    </button>
    <input
      :id="id"
      :value="digits"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      autocomplete="off"
      :required="required"
      :placeholder="placeholder"
      class="glass-input"
      @input="onInput"
    >
  </div>
</template>
