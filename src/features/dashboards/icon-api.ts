import { apiRequestWithResponse } from '@/lib/api-client'

export type ListIconsParams = {
  page?: number
  limit?: number
  nome?: string
}

export type ListIconsResult = {
  icons: string[]
  totalCount: number
}

function parseTotalCount(headerValue: string | null): number {
  if (!headerValue) {
    return 0
  }

  const parsed = Number(headerValue)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function listIcons(params: ListIconsParams = {}): Promise<ListIconsResult> {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(params.page ?? 1))
  searchParams.set('limit', String(params.limit ?? 60))

  if (params.nome?.trim()) {
    searchParams.set('nome', params.nome.trim())
  }

  const { data, response } = await apiRequestWithResponse<string[]>(
    `/icones?${searchParams.toString()}`,
  )

  return {
    icons: data,
    totalCount: parseTotalCount(response.headers.get('x-total-count')),
  }
}
