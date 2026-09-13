<script setup lang="ts">
const route = useRoute()
const api = useApi()

const email = ref('')
const password = ref('')
// Supports the /register?key=... shortcut the old page had.
const registrationKey = ref((route.query.key as string) || '')
const message = ref('')
const ok = ref(false)
const busy = ref(false)

async function onSubmit() {
  busy.value = true
  ok.value = false
  message.value = 'Creating account…'
  try {
    await api.register(email.value, password.value, registrationKey.value)
    ok.value = true
    message.value = 'Account created! Redirecting to login…'
    setTimeout(() => navigateTo('/login'), 1500)
  }
  catch (error) {
    message.value = apiErrorMessage(error)
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center px-5 py-10">
    <GlassCard title="✍️ Create Account">
      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <div class="flex flex-col gap-1">
          <label for="email" class="field-label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="glass-input"
          >
        </div>

        <div class="flex flex-col gap-1">
          <label for="password" class="field-label">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            required
            class="glass-input"
          >
        </div>

        <div class="flex flex-col gap-1">
          <label for="key" class="field-label">Secret Registration Key</label>
          <input
            id="key"
            v-model="registrationKey"
            type="password"
            required
            class="glass-input"
          >
        </div>

        <button type="submit" class="glass-btn" :disabled="busy">
          {{ busy ? 'Creating…' : 'Create Account' }}
        </button>

        <p
          v-if="message"
          class="text-center text-[13px]"
          :class="ok ? 'text-points-up' : 'text-points-down'"
        >
          {{ message }}
        </p>

        <NuxtLink to="/login" class="text-center text-[12px] text-ink underline">
          Already have an account? Sign in
        </NuxtLink>
      </form>
    </GlassCard>
  </main>
</template>
