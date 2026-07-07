export type AccessDashboard = {
  id: number
  nome: string
  icone: string
  idProprietario?: number
}

export type UserDashboardAccessLists = {
  dashboards: AccessDashboard[]
  dashboardsDisponiveis: AccessDashboard[]
}

export type UserDashboardAccessListsApiRecord = {
  dashboards?: Array<{
    id: number | string
    nome: string
    icone?: string | null
    id_proprietario?: number | string | null
    idProprietario?: number | string | null
  }>
  dashboardsDisponiveis?: Array<{
    id: number | string
    nome: string
    icone?: string | null
    id_proprietario?: number | string | null
    idProprietario?: number | string | null
  }>
}
