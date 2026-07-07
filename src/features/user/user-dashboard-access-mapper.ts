import type {
  AccessDashboard,
  UserDashboardAccessLists,
  UserDashboardAccessListsApiRecord,
} from '@/features/user/user-dashboard-access-types'

function mapAccessDashboardFromApi(
  record: NonNullable<UserDashboardAccessListsApiRecord['dashboards']>[number],
): AccessDashboard | null {
  const id = Number(record.id)
  const nome =
    typeof record.nome === 'string' && record.nome.trim().length > 0
      ? record.nome.trim()
      : 'Dashboard sem nome'
  const icone =
    typeof record.icone === 'string' && record.icone.trim().length > 0
      ? record.icone.trim()
      : 'insert_chart'
  const rawOwnerId = record.id_proprietario ?? record.idProprietario
  const ownerId = Number(rawOwnerId)

  if (!Number.isFinite(id)) {
    return null
  }

  return {
    id,
    nome,
    icone,
    ...(Number.isFinite(ownerId) && ownerId > 0 ? { idProprietario: ownerId } : {}),
  }
}

export function mapUserDashboardAccessListsFromApi(
  record: UserDashboardAccessListsApiRecord,
): UserDashboardAccessLists {
  const dashboards = (record.dashboards ?? [])
    .map(mapAccessDashboardFromApi)
    .filter((dashboard): dashboard is AccessDashboard => dashboard !== null)

  const dashboardsDisponiveis = (record.dashboardsDisponiveis ?? [])
    .map(mapAccessDashboardFromApi)
    .filter((dashboard): dashboard is AccessDashboard => dashboard !== null)

  return {
    dashboards,
    dashboardsDisponiveis,
  }
}
