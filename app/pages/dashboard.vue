<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user, role, isSuperuser, session, ready, signOut } = useAuth()
const { people, nameById, refresh: refreshPeople } = useLeaderboard()

const logsRef = ref<{ reload: () => void } | null>(null)

function onChanged() {
  refreshPeople()
  logsRef.value?.reload()
}

async function onSignOut() {
  await signOut()
  await navigateTo('/')
}
</script>

<template>
  <main class="mx-auto w-full max-w-[430px] px-5 pt-6 pb-16 lg:max-w-3xl lg:pt-10">
    <p v-if="!ready || !session" class="py-10 text-center text-[14px] text-ink">
      Checking your session…
    </p>

    <template v-else>
      <header class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <h1 class="text-[18px] text-ink">
            ⚡ Tip Dashboard
          </h1>
          <p v-if="user" class="truncate text-[12px] text-ink">
            {{ user.email }} · {{ role }}
          </p>
        </div>
        <div class="flex shrink-0 gap-2">
          <NuxtLink to="/" class="glass-btn !min-h-0 !px-3 !py-2 !text-[12px]">
            Leaderboard
          </NuxtLink>
          <button type="button" class="glass-btn !min-h-0 !px-3 !py-2 !text-[12px]" @click="onSignOut">
            Log out
          </button>
        </div>
      </header>

      <div class="flex flex-col gap-[30px]">
        <DashboardTipForm :people="people" @changed="onChanged" />

        <template v-if="isSuperuser">
          <DashboardSettings />
          <DashboardLogs ref="logsRef" :name-by-id="nameById" @changed="refreshPeople" />
          <DashboardPeople :people="people" @changed="onChanged" />
          <DashboardAccounts />
        </template>
      </div>
    </template>
  </main>
</template>
