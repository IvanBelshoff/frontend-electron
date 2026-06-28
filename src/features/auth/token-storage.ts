import { secureStorage } from '@/lib/electron'

export async function loadPersistedToken(): Promise<string | null> {
  if (!secureStorage) {
    return null
  }

  return secureStorage.getToken()
}

export async function persistToken(token: string): Promise<void> {
  if (!secureStorage) {
    return
  }

  await secureStorage.setToken(token)
}

export async function clearPersistedToken(): Promise<void> {
  if (!secureStorage) {
    return
  }

  await secureStorage.clearToken()
}
