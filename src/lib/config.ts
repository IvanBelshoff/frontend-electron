const API_URL_STORAGE_KEY = 'datadash.apiUrl'

let hostnameMismatchWarned = false

export function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '')

  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error('URL inválida. Use http:// ou https://')
  }

  new URL(trimmed)
  return trimmed
}

export function getDefaultApiUrl(): string {
  const url = import.meta.env.VITE_API_URL as string | undefined

  if (!url) {
    throw new Error('VITE_API_URL não configurada.')
  }

  return normalizeBaseUrl(url)
}

export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(API_URL_STORAGE_KEY)

    if (stored) {
      try {
        return normalizeBaseUrl(stored)
      } catch {
        localStorage.removeItem(API_URL_STORAGE_KEY)
      }
    }
  }

  return getDefaultApiUrl()
}

export function warnApiHostnameMismatch(): void {
  if (typeof window === 'undefined' || hostnameMismatchWarned) {
    return
  }

  const pageHostname = window.location.hostname
  if (!pageHostname || pageHostname === 'null') {
    return
  }

  let apiHostname: string
  try {
    apiHostname = new URL(getApiUrl()).hostname
  } catch {
    return
  }

  if (pageHostname !== apiHostname) {
    hostnameMismatchWarned = true
    console.warn(
      `[DataDash] Hostname da página (${pageHostname}) difere do hostname da API (${apiHostname}). ` +
        'O refresh token HttpOnly pode não funcionar. Acesse o app pelo mesmo IP configurado em VITE_HOST_IP.',
    )
  }
}

export function saveApiUrl(url: string): string {
  const normalized = normalizeBaseUrl(url)
  localStorage.setItem(API_URL_STORAGE_KEY, normalized)
  hostnameMismatchWarned = false
  warnApiHostnameMismatch()
  return normalized
}

export function clearApiUrlOverride(): void {
  localStorage.removeItem(API_URL_STORAGE_KEY)
  hostnameMismatchWarned = false
  warnApiHostnameMismatch()
}

export function getRegrasPermissoes(): Record<string, string[]> {
  const raw = import.meta.env.VITE_REGRAS_PERMISSOES as string | undefined

  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw) as Record<string, string[]>
  } catch {
    return {}
  }
}

export function getDevServerUrl(): string {
  const hostIp = import.meta.env.VITE_HOST_IP as string | undefined
  const devPort = import.meta.env.VITE_DEV_PORT || '5173'

  if (!hostIp) {
    throw new Error('VITE_HOST_IP não configurada.')
  }

  return `http://${hostIp}:${devPort}`
}
