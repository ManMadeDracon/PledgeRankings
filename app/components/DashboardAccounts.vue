<script setup lang="ts">
interface Profile {
  id: string
  email: string | null
  role: string
}

const supabase = useSupabase()
const api = useApi()
const { user } = useAuth()

const profiles = ref<Profile[]>([])
const message = ref('')
const ok = ref(false)
const busy = ref(false)

const newEmail = ref('')
const newPassword = ref('')
const newRole = ref<'standard' | 'superuser'>('standard')

const confirmDeleteId = ref<string | null>(null)

async function loadUsers() {
  const { data, error } = await supabase.from('profiles').select('id, email, role')
  if (error) {
    ok.value = false
    message.value = error.message
    return
  }
  profiles.value = (data ?? []) as Profile[]
}

async function run(fn: () => Promise<unknown>, success: string) {
  busy.value = true
  message.value = ''
  try {
    await fn()
    ok.value = true
    message.value = success
    await loadUsers()
  }
  catch (error) {
    ok.value = false
    message.value = apiErrorMessage(error)
  }
  finally {
    busy.value = false
  }
}

async function createUser() {
  await run(
    () => api.manageUsers({
      action: 'create_user',
      email: newEmail.value,
      password: newPassword.value,
      role: newRole.value,
    }),
    'Account created.',
  )
  newEmail.value = ''
  newPassword.value = ''
  newRole.value = 'standard'
}

async function updateRole(profile: Profile) {
  const role = profile.role === 'superuser' ? 'standard' : 'superuser'
  await run(
    () => api.manageUsers({ action: 'update_role', userId: profile.id, role }),
    `Role updated to ${role}.`,
  )
}

async function deleteUser(userId: string) {
  await run(
    () => api.manageUsers({ action: 'delete_user', userId }),
    'Account deleted.',
  )
  confirmDeleteId.value = null
}

onMounted(loadUsers)
</script>

<template>
  <GlassCard title="🔐 Manage Accounts">
    <form class="mb-4 flex flex-col gap-2" @submit.prevent="createUser">
      <input v-model="newEmail" type="email" required class="glass-input" placeholder="User email">
      <input v-model="newPassword" type="password" required class="glass-input" placeholder="Password">
      <select v-model="newRole" class="glass-input">
        <option value="standard">Standard User</option>
        <option value="superuser">Superuser</option>
      </select>
      <button type="submit" class="glass-btn" :disabled="busy">
        Create Account
      </button>
    </form>

    <ul class="flex flex-col gap-2">
      <li
        v-for="profile in profiles"
        :key="profile.id"
        class="rounded-xl bg-white/35 p-3"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="min-w-0 break-all text-[13px] text-ink-strong">
            <strong>{{ profile.email || profile.id }}</strong>
            <span class="text-ink"> · {{ profile.role }}</span>
          </span>

          <div v-if="profile.id !== user?.id" class="flex flex-wrap gap-2">
            <button
              type="button"
              class="glass-btn !min-h-0 !px-3 !py-1.5 !text-[12px]"
              :disabled="busy"
              @click="updateRole(profile)"
            >
              {{ profile.role === 'superuser' ? 'Demote' : 'Promote' }}
            </button>
            <button
              type="button"
              class="glass-btn glass-btn-danger !min-h-0 !px-3 !py-1.5 !text-[12px]"
              @click="confirmDeleteId = confirmDeleteId === profile.id ? null : profile.id"
            >
              Delete
            </button>
          </div>
          <span v-else class="text-[12px] text-ink">that's you</span>
        </div>

        <div v-if="confirmDeleteId === profile.id" class="mt-3 flex flex-wrap items-center gap-2">
          <span class="text-[13px] text-points-down">Delete this account permanently?</span>
          <button
            type="button"
            class="glass-btn glass-btn-danger !min-h-0 !py-2"
            :disabled="busy"
            @click="deleteUser(profile.id)"
          >
            Yes, delete
          </button>
          <button type="button" class="glass-btn !min-h-0 !py-2" @click="confirmDeleteId = null">
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
