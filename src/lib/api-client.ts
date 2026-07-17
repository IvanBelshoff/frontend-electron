import { getApiUrl } from './config'
import { ApiError, type ApiErrorBody } from '@/features/auth/auth-types'
import { authStore } from '@/features/auth/auth-store'
import { persistToken } from '@/features/auth/token-storage'

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
  await persistToken(body.access_token)
  return body.access_token
}

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  skipAuth?: boolean
  skipRefresh?: boolean
}

export type ApiRequestResult<T> = {
  data: T
  response: Response
}

async function executeApiRequest(
  path: string,
  options: ApiRequestOptions = {},
): Promise<{ response: Response; payload: unknown }> {
  const { body, skipAuth = false, skipRefresh = false, ...init } = options

  const execute = async (token?: string | null) => {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

    if (!skipAuth && token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    if (body !== undefined && !isFormData) {
      headers.set('Content-Type', 'application/json')
    }

    return fetch(`${getApiUrl()}${path}`, {
      ...init,
      headers,
      credentials: 'include',
      body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
    })
  }

  let response = await execute(skipAuth ? null : authStore.getAccessToken())

  if (
    response.status === 401 &&
    !skipAuth &&
    !skipRefresh &&
    !path.startsWith('/auth/login') &&
    path !== '/auth/refresh'
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
      payload,
    )
  }

  return { response, payload }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { payload } = await executeApiRequest(path, options)
  return payload as T
}

export async function apiRequestWithResponse<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiRequestResult<T>> {
  const { response, payload } = await executeApiRequest(path, options)
  return { data: payload as T, response }
}

function parseContentDispositionFilename(header: string | null): string | undefined {
  if (!header) {
    return undefined
  }

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }

  const quotedMatch = header.match(/filename="([^"]+)"/i)
  if (quotedMatch?.[1]) {
    return quotedMatch[1]
  }

  const plainMatch = header.match(/filename=([^;]+)/i)
  if (plainMatch?.[1]) {
    return plainMatch[1].trim()
  }

  return undefined
}

export type ApiBlobResult = {
  blob: Blob
  filename?: string
}

export async function apiRequestBlob(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiBlobResult> {
  const { body, skipAuth = false, skipRefresh = false, ...init } = options

  const execute = async (token?: string | null) => {
    const headers = new Headers(init.headers)
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

    if (!skipAuth && token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    if (body !== undefined && !isFormData) {
      headers.set('Content-Type', 'application/json')
    }

    return fetch(`${getApiUrl()}${path}`, {
      ...init,
      headers,
      credentials: 'include',
      body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
    })
  }

  let response = await execute(skipAuth ? null : authStore.getAccessToken())

  if (
    response.status === 401 &&
    !skipAuth &&
    !skipRefresh &&
    !path.startsWith('/auth/login') &&
    path !== '/auth/refresh'
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

  if (!response.ok) {
    const payload = await parseResponseBody(response)
    throw new ApiError(
      extractErrorMessage(payload, 'Falha na requisição.'),
      response.status,
      payload,
    )
  }

  const blob = await response.blob()

  return {
    blob,
    filename: parseContentDispositionFilename(response.headers.get('Content-Disposition')),
  }
}

export function saveBlobAsFile(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}
