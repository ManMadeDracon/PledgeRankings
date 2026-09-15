export interface SubmitTipBody {
  personIds: Array<number | string>
  points: number | string
  reason?: string
  description?: string
}

export interface SystemSettings {
  max_points_limit: number
  time_window_hours: number
}

/** Turns an ofetch rejection into the server's statusMessage. */
export function apiErrorMessage(error: unknown): string {
  const data = (error as { data?: { statusMessage?: string, message?: string } })?.data
  return data?.statusMessage || data?.message || (error as Error)?.message || 'Request failed'
}

export function useApi() {
  const { token } = useAuth()

  const authHeaders = () =>
    token.value ? { Authorization: `Bearer ${token.value}` } : {}

  return {
    getUserLimits: () =>
      $fetch<UserLimits>('/api/user-limits', {
        headers: authHeaders(),
      }),
      
    submitTip: (body: SubmitTipBody) =>
      $fetch<{ success: true }>('/api/submit-tip', {
        method: 'POST',
        headers: authHeaders(),
        body,
      }),

    adminAction: <T = { success: true }>(action: string, payload: Record<string, unknown> = {}) =>
      $fetch<T>('/api/admin-action', {
        method: 'POST',
        headers: authHeaders(),
        body: { action, payload },
      }),

    manageUsers: (body: Record<string, unknown>) =>
      $fetch<{ success: true }>('/api/manage-users', {
        method: 'POST',
        headers: authHeaders(),
        body,
      }),

    register: (email: string, password: string, registrationKey: string) =>
      $fetch<{ success: true }>('/api/register', {
        method: 'POST',
        body: { email, password, registrationKey },
      }),
  }
}
