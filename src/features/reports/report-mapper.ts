import type { Privacidade } from '@/features/dashboards/dashboard-types'
import { coerceApiDateString, toDateInputValue as toDateInputValueFromApi } from '@/lib/datetime'
import type {
  CreateReportInput,
  EstadoRelatorio,
  ParametroRelatorio,
  Report,
  ReportConnectionRef,
  ReportEditDraft,
  ReportUser,
  UpdateReportInput,
} from '@/features/reports/report-types'

export type ReportApiUserRecord = {
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

export type ReportApiConnectionRecord = {
  id: number | string
  nome: string
  tipo: string
}

export type ReportApiRecord = {
  id: number | string
  nome: string
  icone?: string | null
  query: string
  id_conexao: number | string
  conexao?: ReportApiConnectionRecord | null
  parametros?: ParametroRelatorio[] | null
  temporario: boolean
  data_expiracao_inicial?: string | null
  data_expiracao_final?: string | null
  id_proprietario?: number | string | null
  privacidade?: Privacidade | null
  visivel?: boolean | null
  estado: EstadoRelatorio
  snapshot_atualizado_em?: string | null
  snapshot_valido: boolean
  erro_ultima_geracao?: string | null
  limite_linhas: number
  timeout_ms: number
  usuario_cadastrador?: string | null
  usuario_atualizador?: string | null
  data_criacao?: string | null
  data_atualizacao?: string | null
  usuario?: ReportApiUserRecord[]
}

function normalizePrivacidade(value: unknown): Privacidade {
  return value === 'publico' ? 'publico' : 'privado'
}

function normalizeEstado(value: unknown): EstadoRelatorio {
  if (value === 'offline' || value === 'gerando_snapshot') {
    return value
  }

  return 'online'
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
  return toDateInputValueFromApi(normalized) || null
}

function mapConnectionFromApi(
  connection?: ReportApiConnectionRecord | null,
): ReportConnectionRef | null | undefined {
  if (!connection) {
    return connection === null ? null : undefined
  }

  return {
    id: Number(connection.id),
    nome: connection.nome,
    tipo: connection.tipo,
  }
}

function mapUsersFromApi(users?: ReportApiUserRecord[]): ReportUser[] | undefined {
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
          type: user.foto.type ?? user.foto.tipo,
        }
      : null,
  }))
}

export function mapReportFromApi(record: ReportApiRecord): Report {
  return {
    id: Number(record.id),
    nome: record.nome,
    icone: record.icone ?? 'table_chart',
    query: record.query,
    idConexao: Number(record.id_conexao),
    conexao: mapConnectionFromApi(record.conexao),
    parametros: record.parametros ?? null,
    visivel: Boolean(record.visivel),
    privacidade: normalizePrivacidade(record.privacidade),
    temporario: Boolean(record.temporario),
    estado: normalizeEstado(record.estado),
    snapshotAtualizadoEm: coerceApiDateString(record.snapshot_atualizado_em) ?? null,
    snapshotValido: Boolean(record.snapshot_valido),
    erroUltimaGeracao: normalizeOptionalString(record.erro_ultima_geracao),
    limiteLinhas: Number(record.limite_linhas),
    timeoutMs: Number(record.timeout_ms),
    idProprietario:
      record.id_proprietario != null ? Number(record.id_proprietario) : undefined,
    dataExpiracaoInicial: toDateInputValue(record.data_expiracao_inicial),
    dataExpiracaoFinal: toDateInputValue(record.data_expiracao_final),
    usuarioCadastrador: normalizeOptionalString(record.usuario_cadastrador) ?? undefined,
    usuarioAtualizador: normalizeOptionalString(record.usuario_atualizador) ?? undefined,
    dataCriacao: coerceApiDateString(record.data_criacao),
    dataAtualizacao: coerceApiDateString(record.data_atualizacao),
    usuarios: mapUsersFromApi(record.usuario),
  }
}

export function mapReportListFromApi(records: ReportApiRecord[]): Report[] {
  return records.map(mapReportFromApi)
}

export function mapReportToEditDraft(report: Report): ReportEditDraft {
  return {
    nome: report.nome,
    icone: report.icone,
    query: report.query,
    idConexao: report.idConexao,
    parametros: report.parametros ?? [],
    privacidade: report.privacidade,
    visivel: report.visivel,
    temporario: report.temporario,
    estado: report.estado,
    limiteLinhas: report.limiteLinhas,
    timeoutMs: report.timeoutMs,
    dataExpiracaoInicial: report.dataExpiracaoInicial ?? null,
    dataExpiracaoFinal: report.dataExpiracaoFinal ?? null,
  }
}

function mapReportDraftToApi(input: ReportEditDraft): Record<string, unknown> {
  return {
    nome: input.nome.trim(),
    icone: input.icone,
    query: input.query.trim(),
    id_conexao: input.idConexao,
    parametros: input.parametros.length > 0 ? input.parametros : null,
    privacidade: input.privacidade,
    visivel: input.visivel,
    temporario: input.temporario,
    estado: input.estado,
    limite_linhas: input.limiteLinhas,
    timeout_ms: input.timeoutMs,
    data_expiracao_inicial: input.temporario ? input.dataExpiracaoInicial ?? null : null,
    data_expiracao_final: input.temporario ? input.dataExpiracaoFinal ?? null : null,
  }
}

export function mapReportToUpdateApi(input: UpdateReportInput): Record<string, unknown> {
  const body: Record<string, unknown> = {}

  if (input.nome !== undefined) body.nome = input.nome.trim()
  if (input.icone !== undefined) body.icone = input.icone
  if (input.query !== undefined) body.query = input.query.trim()
  if (input.idConexao !== undefined && input.idConexao !== null) {
    body.id_conexao = input.idConexao
  }
  if (input.parametros !== undefined) {
    body.parametros = input.parametros.length > 0 ? input.parametros : null
  }
  if (input.privacidade !== undefined) body.privacidade = input.privacidade
  if (input.visivel !== undefined) body.visivel = input.visivel
  if (input.temporario !== undefined) body.temporario = input.temporario
  if (input.estado !== undefined) body.estado = input.estado
  if (input.limiteLinhas !== undefined) body.limite_linhas = input.limiteLinhas
  if (input.timeoutMs !== undefined) body.timeout_ms = input.timeoutMs
  if (input.dataExpiracaoInicial !== undefined) {
    body.data_expiracao_inicial = input.dataExpiracaoInicial
  }
  if (input.dataExpiracaoFinal !== undefined) {
    body.data_expiracao_final = input.dataExpiracaoFinal
  }
  if (input.parametrosSnapshot !== undefined) {
    body.parametros_snapshot = input.parametrosSnapshot
  }

  if (Object.keys(body).length === 0) {
    return mapReportDraftToApi(input as ReportEditDraft)
  }

  return body
}

export function mapReportToCreateApi(input: CreateReportInput): Record<string, unknown> {
  const body = mapReportDraftToApi({
    ...input,
    estado: input.estado ?? 'online',
  })

  if (!input.temporario) {
    delete body.data_expiracao_inicial
    delete body.data_expiracao_final
  }

  delete body.estado

  if (body.parametros === null) {
    delete body.parametros
  }

  return body
}

export function areReportDraftsEqual(a: ReportEditDraft, b: ReportEditDraft): boolean {
  return (
    a.nome === b.nome &&
    a.icone === b.icone &&
    a.query === b.query &&
    a.idConexao === b.idConexao &&
    JSON.stringify(a.parametros) === JSON.stringify(b.parametros) &&
    a.privacidade === b.privacidade &&
    a.visivel === b.visivel &&
    a.temporario === b.temporario &&
    a.estado === b.estado &&
    a.limiteLinhas === b.limiteLinhas &&
    a.timeoutMs === b.timeoutMs &&
    (a.dataExpiracaoInicial ?? null) === (b.dataExpiracaoInicial ?? null) &&
    (a.dataExpiracaoFinal ?? null) === (b.dataExpiracaoFinal ?? null)
  )
}
