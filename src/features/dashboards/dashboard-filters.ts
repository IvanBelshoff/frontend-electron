import type { Dashboard, DashboardFilters } from '@/features/dashboards/dashboard-types'

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  privacidade: 'all',
  visivel: 'all',
  temporario: 'all',
}

export function areDashboardFiltersEqual(a: DashboardFilters, b: DashboardFilters): boolean {
  return (
    a.privacidade === b.privacidade &&
    a.visivel === b.visivel &&
    a.temporario === b.temporario
  )
}

export function hasActiveDashboardFilters(filters: DashboardFilters): boolean {
  return !areDashboardFiltersEqual(filters, DEFAULT_DASHBOARD_FILTERS)
}

export function applyDashboardFilters(
  dashboards: Dashboard[],
  search: string,
  filters: DashboardFilters,
): Dashboard[] {
  const normalizedSearch = search.trim().toLowerCase()

  return dashboards.filter((dashboard) => {
    if (normalizedSearch && !dashboard.nome.toLowerCase().includes(normalizedSearch)) {
      return false
    }

    if (filters.privacidade !== 'all' && dashboard.privacidade !== filters.privacidade) {
      return false
    }

    if (filters.visivel !== 'all' && dashboard.visivel !== filters.visivel) {
      return false
    }

    if (filters.temporario !== 'all' && dashboard.temporario !== filters.temporario) {
      return false
    }

    return true
  })
}
