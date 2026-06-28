const API_URL_STORAGE_KEY = 'datadash.apiUrl'

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

export function saveApiUrl(url: string): string {
  const normalized = normalizeBaseUrl(url)
  localStorage.setItem(API_URL_STORAGE_KEY, normalized)
  return normalized
}

export function clearApiUrlOverride(): void {
  localStorage.removeItem(API_URL_STORAGE_KEY)
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
