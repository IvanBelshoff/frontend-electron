import type { Dashboard, Privacidade } from '@/features/dashboards/dashboard-types'

export type MyDashboardViewMode = 'grid' | 'table'

export type MyDashboardFilters = {
  favoritos: boolean
  privacidade: 'all' | Privacidade
  temporario: 'all' | boolean
}

export type MyDashboardListResult = {
  items: Dashboard[]
  favoriteIds: number[]
  totalCount: number
}

export type ListMyDashboardsParams = {
  page?: number
  limit?: number
  nome?: string
  favoritos?: boolean
  privacidade?: Privacidade
  temporario?: boolean
}
