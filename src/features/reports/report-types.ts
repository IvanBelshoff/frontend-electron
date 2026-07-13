import type { Privacidade } from '@/features/dashboards/dashboard-types'
import type { UserPhoto } from '@/features/user/user-types'

export type EstadoRelatorio = 'online' | 'offline' | 'gerando_snapshot'

export type ParametroTipo = 'string' | 'number' | 'date' | 'boolean' | 'enum'

export type ParametroRelatorio = {
  nome: string
  tipo: ParametroTipo
  obrigatorio?: boolean
  padrao?: string | number | boolean | null
  label?: string
  valores?: string[]
}

export type ReportViewMode = 'grid' | 'table'

export type ReportEditTab = 'report' | 'access' | 'execution' | 'schedule'

export type ReportUser = {
  id: number
  nome: string
  sobrenome: string
  foto?: UserPhoto | null
}

export type ReportConnectionRef = {
  id: number
  nome: string
  tipo: string
}

export type Report = {
  id: number
  nome: string
  icone: string
  query: string
  idConexao: number
  conexao?: ReportConnectionRef | null
  parametros?: ParametroRelatorio[] | null
  visivel: boolean
  privacidade: Privacidade
  temporario: boolean
  estado: EstadoRelatorio
  snapshotAtualizadoEm?: string | null
  snapshotValido: boolean
  erroUltimaGeracao?: string | null
  limiteLinhas: number
  timeoutMs: number
  idProprietario?: number | null
  dataExpiracaoInicial?: string | null
  dataExpiracaoFinal?: string | null
  usuarioCadastrador?: string
  usuarioAtualizador?: string
  dataCriacao?: string
  dataAtualizacao?: string
  usuarios?: ReportUser[]
}

export type ReportEditDraft = {
  nome: string
  icone: string
  query: string
  idConexao: number | null
  parametros: ParametroRelatorio[]
  privacidade: Privacidade
  visivel: boolean
  temporario: boolean
  estado: EstadoRelatorio
  limiteLinhas: number
  timeoutMs: number
  dataExpiracaoInicial?: string | null
  dataExpiracaoFinal?: string | null
}

export type CreateReportInput = Omit<ReportEditDraft, 'estado'> & {
  estado?: EstadoRelatorio
}

export type UpdateReportInput = Partial<ReportEditDraft> & {
  parametrosSnapshot?: Record<string, unknown>
}

export type ReportCreateSaveMode = 'list' | 'edit'

export const INITIAL_REPORT_CREATE_DRAFT: ReportEditDraft = {
  nome: '',
  icone: 'table_chart',
  query: '',
  idConexao: null,
  parametros: [],
  privacidade: 'privado',
  visivel: true,
  temporario: false,
  estado: 'online',
  limiteLinhas: 10000,
  timeoutMs: 30000,
  dataExpiracaoInicial: null,
  dataExpiracaoFinal: null,
}

export type ReportFilters = {
  privacidade: 'all' | Privacidade
  visivel: 'all' | boolean
  temporario: 'all' | boolean
  estado: 'all' | EstadoRelatorio
}

export type ReportFieldErrors = {
  nome?: string
  query?: string
  idConexao?: string
  general?: string
}

export type ReportDataResult = {
  estado?: EstadoRelatorio
  colunas: string[]
  dados: Record<string, unknown>[]
  totalLinhas: number
  page?: number
  pageSize?: number
  snapshotAtualizadoEm?: string | null
  snapshotValido?: boolean
  parametrosUtilizados?: Record<string, unknown>
}

export type ReportStatusResult = {
  estado: EstadoRelatorio
  snapshotAtualizadoEm?: string | null
  snapshotValido: boolean
  erroUltimaGeracao?: string | null
}

export type ReportExecutionParams = Record<string, unknown>

export type ReportDataQueryParams = {
  parametros?: ReportExecutionParams
  page?: number
  pageSize?: number
}

export type ReportJobStatus = 'queued' | 'processing' | 'completed' | 'failed'

export type ReportJobTipo = 'snapshot' | 'export_csv'

export type ReportJobStatusResult = {
  jobId: string
  tipo: ReportJobTipo
  status: ReportJobStatus
  progress: number
  relatorioId: number
  errorMessage: string | null
  downloadAvailable: boolean
  createdAt: string
  completedAt: string | null
}

export type ExportReportResponse = {
  jobId: string
  status: 'queued'
  message: string
}

export type SnapshotRefreshResponse = {
  relatorio?: Report
  jobId: string
}
