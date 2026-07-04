import {
  mapDashboardFromApi,
  mapDashboardListFromApi,
  mapDashboardToCreateApi,
  mapDashboardToUpdateApi,
  type DashboardApiRecord,
} from '@/features/dashboards/dashboard-mapper'
import type {
  CreateDashboardInput,
  Dashboard,
  UpdateDashboardInput,
} from '@/features/dashboards/dashboard-types'
import { apiRequest, apiRequestWithResponse } from '@/lib/api-client'

export type ListDashboardsParams = {
  page?: number
  limit?: number
  nome?: string
  visivel?: boolean
  privacidade?: 'privado' | 'publico'
  temporario?: boolean
}

export type ListDashboardsResult = {
  items: Dashboard[]
  totalCount: number
}

function buildDashboardsQuery(params: ListDashboardsParams): string {
  const searchParams = new URLSearchParams()

  searchParams.set('page', String(params.page ?? 1))
  searchParams.set('limit', String(params.limit ?? 100))

  if (params.nome) {
    searchParams.set('nome', params.nome)
  }

  if (params.visivel !== undefined) {
    searchParams.set('visivel', String(params.visivel))
  }

  if (params.privacidade) {
    searchParams.set('privacidade', params.privacidade)
  }

  if (params.temporario !== undefined) {
    searchParams.set('temporario', String(params.temporario))
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

export async function listDashboards(
  params: ListDashboardsParams = {},
): Promise<ListDashboardsResult> {
  const query = buildDashboardsQuery(params)
  const { data, response } = await apiRequestWithResponse<DashboardApiRecord[]>(
    `/dashboards?${query}`,
  )

  return {
    items: mapDashboardListFromApi(data),
    totalCount: parseTotalCount(response.headers.get('x-total-count')),
  }
}

export async function getDashboard(id: number): Promise<Dashboard> {
  const data = await apiRequest<DashboardApiRecord>(`/dashboards/${id}`)
  return mapDashboardFromApi(data)
}

export async function createDashboard(input: CreateDashboardInput): Promise<Dashboard> {
  const data = await apiRequest<DashboardApiRecord>('/dashboards', {
    method: 'POST',
    body: mapDashboardToCreateApi(input),
  })

  return mapDashboardFromApi(data)
}

export async function updateDashboard(
  id: number,
  input: UpdateDashboardInput,
): Promise<Dashboard> {
  const data = await apiRequest<DashboardApiRecord>(`/dashboards/${id}`, {
    method: 'PATCH',
    body: mapDashboardToUpdateApi(input),
  })

  return mapDashboardFromApi(data)
}

export async function assignDashboardUsers(
  id: number,
  usuarios: number[],
): Promise<void> {
  await apiRequest<void>(`/dashboards/users/${id}`, {
    method: 'PATCH',
    body: { usuarios },
  })
}

export async function deleteDashboard(id: number): Promise<void> {
  await apiRequest<void>(`/dashboards/${id}`, { method: 'DELETE' })
}
