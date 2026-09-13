export default defineNuxtRouteMiddleware(async (to) => {
  // Session lives in browser storage, so the check only runs client-side.
  if (import.meta.server) return

  const { session, init } = useAuth()
  await init()

  if (!session.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
