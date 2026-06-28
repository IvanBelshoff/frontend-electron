import { getApiUrl } from './config'
import { ApiError, type ApiErrorBody } from '@/features/auth/auth-types'
import { authStore } from '@/features/auth/auth-store'

let refreshPromise: Promise<string | null> | null = null

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    const body = payload as ApiErrorBody
    if (Array.isArray(body.message)) {
      return body.message.join(', ')
    }
    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message
    }
  }

  return fallback
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const response = await fetch(`${getApiUrl()}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    authStore.reset()
    return null
  }

  const body = (await parseResponseBody(response)) as {
    access_token: string
    expires_in: number
  }

  authStore.setAccessToken(body.access_token)
  return body.access_token
}

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  skipAuth?: boolean
  skipRefresh?: boolean
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, skipAuth = false, skipRefresh = false, ...init } = options

  const execute = async (token?: string | null) => {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')

    if (!skipAuth && token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    if (body !== undefined) {
      headers.set('Content-Type', 'application/json')
    }

    return fetch(`${getApiUrl()}${path}`, {
      ...init,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  let response = await execute(skipAuth ? null : authStore.getAccessToken())

  if (
    response.status === 401 &&
    !skipAuth &&
    !skipRefresh &&
    !path.startsWith('/auth/login')
  ) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null
      })
    }

    const newToken = await refreshPromise

    if (newToken) {
      response = await execute(newToken)
    }
  }

  const payload = await parseResponseBody(response)

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(payload, 'Falha na requisição.'),
      response.status,
    )
  }

  return payload as T
}
