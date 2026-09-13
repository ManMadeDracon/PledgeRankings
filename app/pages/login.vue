<script setup lang="ts">
const route = useRoute()
const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const message = ref('')
const busy = ref(false)

async function onSubmit() {
  busy.value = true
  message.value = ''
  try {
    await signIn(email.value, password.value)
    await navigateTo((route.query.redirect as string) || '/dashboard')
  }
  catch (error) {
    message.value = (error as Error).message
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center px-5 py-10">
    <GlassCard title="🔒 Dashboard Login">
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
            autocomplete="current-password"
            required
            class="glass-input"
          >
        </div>

        <button type="submit" class="glass-btn" :disabled="busy">
          {{ busy ? 'Signing in…' : 'Sign In' }}
        </button>

        <p v-if="message" class="text-center text-[13px] text-points-down">
          {{ message }}
        </p>

        <NuxtLink to="/" class="text-center text-[12px] text-ink underline">
          Back to leaderboard
        </NuxtLink>
      </form>
    </GlassCard>
  </main>
</template>
