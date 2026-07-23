import type { ListMyDashboardsParams } from '@/features/my-dashboards/my-dashboard-types'
import type { MyDashboardFilters } from '@/features/my-dashboards/my-dashboard-types'

export const MY_DASHBOARDS_PAGE_SIZE = 50

export const DEFAULT_MY_DASHBOARD_FILTERS: MyDashboardFilters = {
  favoritos: false,
  privacidade: 'all',
  temporario: 'all',
}

export function areMyDashboardFiltersEqual(
  a: MyDashboardFilters,
  b: MyDashboardFilters,
): boolean {
  return (
    a.favoritos === b.favoritos &&
    a.privacidade === b.privacidade &&
    a.temporario === b.temporario
  )
}

export function hasActiveMyDashboardFilters(filters: MyDashboardFilters): boolean {
  return !areMyDashboardFiltersEqual(filters, DEFAULT_MY_DASHBOARD_FILTERS)
}

export function hasActiveMyDashboardDialogFilters(filters: MyDashboardFilters): boolean {
  return filters.privacidade !== 'all' || filters.temporario !== 'all'
}

export function buildMyDashboardListParams(
  search: string,
  filters: MyDashboardFilters,
  page: number,
  limit = MY_DASHBOARDS_PAGE_SIZE,
  sort?: string,
): ListMyDashboardsParams {
  const params: ListMyDashboardsParams = {
    page,
    limit,
  }

  const normalizedSearch = search.trim()
  if (normalizedSearch) {
    params.nome = normalizedSearch
  }

  if (filters.favoritos) {
    params.favoritos = true
  }

  if (filters.privacidade !== 'all') {
    params.privacidade = filters.privacidade
  }

  if (filters.temporario !== 'all') {
    params.temporario = filters.temporario
  }

  if (sort) {
    params.sort = sort
  }

  return params
}
