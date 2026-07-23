import {
  mapDashboardFromApi,
  mapDashboardListFromApi,
  type DashboardApiRecord,
} from '@/features/dashboards/dashboard-mapper'
import type { Dashboard } from '@/features/dashboards/dashboard-types'
import type {
  ListMyDashboardsParams,
  MyDashboardListResult,
} from '@/features/my-dashboards/my-dashboard-types'
import { apiRequest, apiRequestWithResponse } from '@/lib/api-client'

type MyDashboardsApiResponse = {
  data: DashboardApiRecord[]
  favoritos: number[]
}

function buildMyDashboardsQuery(params: ListMyDashboardsParams): string {
  const searchParams = new URLSearchParams()

  searchParams.set('page', String(params.page ?? 1))
  searchParams.set('limit', String(params.limit ?? 50))

  if (params.nome) {
    searchParams.set('nome', params.nome)
  }

  if (params.favoritos) {
    searchParams.set('favoritos', 'true')
  }

  if (params.privacidade) {
    searchParams.set('privacidade', params.privacidade)
  }

  if (params.temporario !== undefined) {
    searchParams.set('temporario', String(params.temporario))
  }

  if (params.sort) {
    searchParams.set('sort', params.sort)
  }

  return searchParams.toString()
}

function parseTotalCount(headerValue: string | null): number {
  if (!headerValue) {
    return 0
  }

  const parsed = Number(headerValue)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function listMyDashboards(
  params: ListMyDashboardsParams = {},
): Promise<MyDashboardListResult> {
  const query = buildMyDashboardsQuery(params)
  const { data, response } = await apiRequestWithResponse<MyDashboardsApiResponse>(
    `/dashboards/private?${query}`,
  )

  return {
    items: mapDashboardListFromApi(data.data),
    favoriteIds: (data.favoritos ?? []).map(Number),
    totalCount: parseTotalCount(response.headers.get('x-total-count')),
  }
}

export async function getMyDashboard(id: number): Promise<Dashboard> {
  const data = await apiRequest<DashboardApiRecord>(`/dashboards/private/${id}`)
  return mapDashboardFromApi(data)
}

export async function updateMyDashboardFavorites(
  userId: number,
  favoritos: number[],
): Promise<void> {
  await apiRequest<void>(`/user/dashboards/favorites/${userId}`, {
    method: 'PATCH',
    body: { favoritos },
  })
}
