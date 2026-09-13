export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const { email, password, registrationKey } = await readBody<{
    email?: string
    password?: string
    registrationKey?: string
  }>(event)

  if (!config.adminPassword) {
    throw createError({ statusCode: 500, statusMessage: 'ADMIN_PASSWORD is not configured' })
  }

  if (!registrationKey || registrationKey !== config.adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid secret key' })
  }

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const { error } = await serviceClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { success: true as const, message: 'Account created successfully' }
})
