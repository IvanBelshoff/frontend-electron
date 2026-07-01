import { normalizeBaseUrl } from '@/lib/config'

export async function validateBackendConnection(baseUrl: string): Promise<void> {
  const normalized = normalizeBaseUrl(baseUrl)
  const response = await fetch(`${normalized}/`, { method: 'GET' })

  if (!response.ok) {
    throw new Error(`Falha ao conectar no backend (${response.status}).`)
  }
}
