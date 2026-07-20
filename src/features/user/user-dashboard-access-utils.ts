import type { AccessDashboard } from '@/features/user/user-dashboard-access-types'

export function sortAccessDashboards(dashboards: AccessDashboard[]): AccessDashboard[] {
  return [...dashboards].sort((left, right) =>
    left.nome.localeCompare(right.nome, 'pt-BR'),
  )
}

export function filterAccessDashboardsBySearch(
  dashboards: AccessDashboard[],
  search: string,
): AccessDashboard[] {
  const normalizedSearch = search.trim().toLowerCase()

  if (!normalizedSearch) {
    return dashboards
  }

  return dashboards.filter((dashboard) =>
    dashboard.nome.toLowerCase().includes(normalizedSearch),
  )
}

export function isOwnerDashboard(dashboard: AccessDashboard, userId: number): boolean {
  if (dashboard.idProprietario == null) {
    return false
  }

  return Number(dashboard.idProprietario) === Number(userId)
}

export function countSelectableGrantedDashboards(
  dashboards: AccessDashboard[],
  userId: number,
): number {
  return dashboards.filter((dashboard) => !isOwnerDashboard(dashboard, userId)).length
}
