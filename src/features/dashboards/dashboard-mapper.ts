import type {
  CreateDashboardInput,
  Dashboard,
  DashboardEditDraft,
  DashboardUser,
  Privacidade,
  UpdateDashboardInput,
} from '@/features/dashboards/dashboard-types'

export type DashboardApiUserRecord = {
  id: number | string
  nome: string
  sobrenome: string
  foto?: {
    id: number | string
    nome?: string
    local?: string
    tipo?: string
    type?: string
    url?: string
  } | null
}

export type DashboardApiRecord = {
  id: number | string
  nome: string
  icone?: string | null
  url: string
  query?: string | null
  temporario: boolean
  data_expiracao_inicial?: string | null
  data_expiracao_final?: string | null
  id_proprietario?: number | string | null
  privacidade?: Privacidade | null
  visivel?: boolean | null
  usuario_cadastrador?: string | null
  usuario_atualizador?: string | null
  data_criacao?: string | null
  data_atualizacao?: string | null
  usuario?: DashboardApiUserRecord[]
}

function normalizePrivacidade(value: unknown): Privacidade {
  return value === 'publico' ? 'publico' : 'privado'
}

function normalizeOptionalString(value: unknown): string | null | undefined {
  if (value === null || value === undefined) {
    return value === null ? null : undefined
  }

  return String(value)
}

function toDateInputValue(value: unknown): string | null | undefined {
  const normalized = normalizeOptionalString(value)
  if (normalized === undefined) return undefined
  if (normalized === null) return null
  return normalized.slice(0, 10)
}

function mapUsersFromApi(users?: DashboardApiUserRecord[]): DashboardUser[] | undefined {
  if (!users?.length) {
    return undefined
  }

  return users.map((user) => ({
    id: Number(user.id),
    nome: user.nome,
    sobrenome: user.sobrenome,
    foto: user.foto
      ? {
          id: Number(user.foto.id),
          nome: user.foto.nome,
          local: user.foto.local,
          type:
            user.foto.type ??
            (user.foto as { tipo?: string }).tipo,
        }
      : null,
  }))
}

export function mapDashboardFromApi(record: DashboardApiRecord): Dashboard {
  return {
    id: Number(record.id),
    nome: record.nome,
    icone: record.icone ?? 'insert_chart',
    url: record.url,
    query: normalizeOptionalString(record.query),
    visivel: Boolean(record.visivel),
    privacidade: normalizePrivacidade(record.privacidade),
    temporario: Boolean(record.temporario),
    idProprietario:
      record.id_proprietario != null ? Number(record.id_proprietario) : undefined,
    dataExpiracaoInicial: toDateInputValue(record.data_expiracao_inicial),
    dataExpiracaoFinal: toDateInputValue(record.data_expiracao_final),
    usuarioCadastrador: normalizeOptionalString(record.usuario_cadastrador) ?? undefined,
    usuarioAtualizador: normalizeOptionalString(record.usuario_atualizador) ?? undefined,
    dataCriacao: normalizeOptionalString(record.data_criacao) ?? undefined,
    dataAtualizacao: normalizeOptionalString(record.data_atualizacao) ?? undefined,
    usuarios: mapUsersFromApi(record.usuario),
  }
}

export function mapDashboardListFromApi(records: DashboardApiRecord[]): Dashboard[] {
  return records.map(mapDashboardFromApi)
}

export function mapDashboardToEditDraft(dashboard: Dashboard): DashboardEditDraft {
  return {
    nome: dashboard.nome,
    icone: dashboard.icone,
    url: dashboard.url,
    query: dashboard.query ?? null,
    privacidade: dashboard.privacidade,
    visivel: dashboard.visivel,
    temporario: dashboard.temporario,
    dataExpiracaoInicial: dashboard.dataExpiracaoInicial ?? null,
    dataExpiracaoFinal: dashboard.dataExpiracaoFinal ?? null,
  }
}

function mapDashboardDraftToApi(input: DashboardEditDraft): Record<string, unknown> {
  return {
    nome: input.nome.trim(),
    url: input.url.trim(),
    icone: input.icone,
    query: input.query ?? null,
    privacidade: input.privacidade,
    visivel: input.visivel,
    temporario: input.temporario,
    data_expiracao_inicial: input.temporario ? input.dataExpiracaoInicial ?? null : null,
    data_expiracao_final: input.temporario ? input.dataExpiracaoFinal ?? null : null,
  }
}

export function mapDashboardToUpdateApi(input: UpdateDashboardInput): Record<string, unknown> {
  return mapDashboardDraftToApi(input)
}

export function mapDashboardToCreateApi(input: CreateDashboardInput): Record<string, unknown> {
  const body = mapDashboardDraftToApi(input)

  if (body.query === null || body.query === undefined) {
    delete body.query
  }

  if (!input.temporario) {
    delete body.data_expiracao_inicial
    delete body.data_expiracao_final
  }

  return body
}

export function areDashboardDraftsEqual(a: DashboardEditDraft, b: DashboardEditDraft): boolean {
  return (
    a.nome === b.nome &&
    a.icone === b.icone &&
    a.url === b.url &&
    (a.query ?? null) === (b.query ?? null) &&
    a.privacidade === b.privacidade &&
    a.visivel === b.visivel &&
    a.temporario === b.temporario &&
    (a.dataExpiracaoInicial ?? null) === (b.dataExpiracaoInicial ?? null) &&
    (a.dataExpiracaoFinal ?? null) === (b.dataExpiracaoFinal ?? null)
  )
}
