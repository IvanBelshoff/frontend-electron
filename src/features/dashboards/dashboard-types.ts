import type { UserPhoto } from '@/features/user/user-types'

export type Privacidade = 'privado' | 'publico'

export type DashboardViewMode = 'grid' | 'table'

export type DashboardEditTab = 'dashboard' | 'access' | 'preview'

export type DashboardUser = {
  id: number
  nome: string
  sobrenome: string
  foto?: UserPhoto | null
}

export type Dashboard = {
  id: number
  nome: string
  icone: string
  url: string
  query?: string | null
  visivel: boolean
  privacidade: Privacidade
  temporario: boolean
  idProprietario?: number | null
  dataExpiracaoInicial?: string | null
  dataExpiracaoFinal?: string | null
  usuarioCadastrador?: string
  usuarioAtualizador?: string
  dataCriacao?: string
  dataAtualizacao?: string
  usuarios?: DashboardUser[]
}

export type DashboardEditDraft = {
  nome: string
  icone: string
  url: string
  query?: string | null
  privacidade: Privacidade
  visivel: boolean
  temporario: boolean
  dataExpiracaoInicial?: string | null
  dataExpiracaoFinal?: string | null
}

export type UpdateDashboardInput = DashboardEditDraft

export type CreateDashboardInput = DashboardEditDraft

export type DashboardCreateSaveMode = 'list' | 'edit'

export const INITIAL_DASHBOARD_CREATE_DRAFT: DashboardEditDraft = {
  nome: '',
  icone: 'insert_chart',
  url: '',
  query: null,
  privacidade: 'privado',
  visivel: true,
  temporario: false,
  dataExpiracaoInicial: null,
  dataExpiracaoFinal: null,
}

export type DashboardFilters = {
  privacidade: 'all' | Privacidade
  visivel: 'all' | boolean
  temporario: 'all' | boolean
}

export type DashboardFieldErrors = {
  nome?: string
  url?: string
  general?: string
}
