// Client-side API helper — wraps fetch with JWT auth headers
const API_BASE = ''

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, unknown> | FormData
  token?: string | null
}

interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options

  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  let fetchBody: BodyInit | undefined
  if (body instanceof FormData) {
    fetchBody = body
  } else if (body) {
    headers['Content-Type'] = 'application/json'
    fetchBody = JSON.stringify(body)
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: fetchBody,
    })

    const data = await res.json()

    if (!res.ok) {
      return { ok: false, error: data.error || 'Something went wrong' }
    }

    return { ok: true, data: data as T }
  } catch (err) {
    return { ok: false, error: 'Network error. Please try again.' }
  }
}

// ─── Convenience Methods ─────────────────────────────────────────────────────

export const api = {
  get: <T = unknown>(path: string, token?: string | null) =>
    apiFetch<T>(path, { method: 'GET', token }),

  post: <T = unknown>(path: string, body: Record<string, unknown>, token?: string | null) =>
    apiFetch<T>(path, { method: 'POST', body, token }),

  put: <T = unknown>(path: string, body: Record<string, unknown>, token?: string | null) =>
    apiFetch<T>(path, { method: 'PUT', body, token }),

  delete: <T = unknown>(path: string, token?: string | null) =>
    apiFetch<T>(path, { method: 'DELETE', token }),
}
