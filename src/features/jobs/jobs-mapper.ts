import type {
  AdminJobListItem,
  AdminJobsFilters,
  AdminJobsListResult,
  AdminScheduleExecutionItem,
  AdminScheduleExecutionsFilters,
  AdminScheduleExecutionsListResult,
  JobOrigem,
} from '@/features/jobs/jobs-types'
import type { ReportJobStatus, ReportJobTipo } from '@/features/reports/report-types'
import type { AgendamentoExecucaoStatus } from '@/features/reports/report-schedule-types'

type AdminJobApiRecord = {
  jobId: string
  tipo: ReportJobTipo
  status: ReportJobStatus
  progress: number
  relatorioId: number
  relatorioNome: string
  userId: number
  userNome: string
  errorMessage: string | null
  downloadAvailable: boolean
  createdAt: string
  completedAt: string | null
  origem: JobOrigem
  parametros: Record<string, unknown>
}

type AdminJobsApiResponse = {
  items: AdminJobApiRecord[]
  page: number
  page_size: number
  total: number
}

type AdminScheduleExecutionApiRecord = {
  id: number
  vinculoId: number
  status: AgendamentoExecucaoStatus
  jobId: string | null
  erro: string | null
  iniciadoEm: string
  concluidoEm: string | null
  relatorioId: number | null
  relatorioNome: string | null
  agendamentoNome: string
}

type AdminScheduleExecutionsApiResponse = {
  items: AdminScheduleExecutionApiRecord[]
  page: number
  page_size: number
  total: number
}

function mapAdminJobFromApi(record: AdminJobApiRecord): AdminJobListItem {
  return {
    jobId: record.jobId,
    tipo: record.tipo,
    status: record.status,
    progress: record.progress,
    relatorioId: record.relatorioId,
    relatorioNome: record.relatorioNome,
    userId: record.userId,
    userNome: record.userNome,
    errorMessage: record.errorMessage,
    downloadAvailable: record.downloadAvailable,
    createdAt: record.createdAt,
    completedAt: record.completedAt,
    origem: record.origem,
    parametros: record.parametros ?? {},
  }
}

function mapScheduleExecutionFromApi(
  record: AdminScheduleExecutionApiRecord,
): AdminScheduleExecutionItem {
  return {
    id: record.id,
    vinculoId: record.vinculoId,
    status: record.status,
    jobId: record.jobId,
    erro: record.erro,
    iniciadoEm: record.iniciadoEm,
    concluidoEm: record.concluidoEm,
    relatorioId: record.relatorioId,
    relatorioNome: record.relatorioNome,
    agendamentoNome: record.agendamentoNome,
  }
}

function parseTotalCount(headerValue: string | null): number {
  const parsed = Number(headerValue)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  }

  const query = search.toString()
  return query ? `?${query}` : ''
}

export { parseTotalCount, mapAdminJobFromApi, mapScheduleExecutionFromApi }

export type {
  AdminJobApiRecord,
  AdminJobsApiResponse,
  AdminScheduleExecutionApiRecord,
  AdminScheduleExecutionsApiResponse,
}

export function mapAdminJobsResponse(
  data: AdminJobsApiResponse,
  totalCount: number,
): AdminJobsListResult {
  return {
    items: (data.items ?? []).map(mapAdminJobFromApi),
    page: data.page,
    pageSize: data.page_size,
    total: totalCount || data.total,
  }
}

export function mapAdminScheduleExecutionsResponse(
  data: AdminScheduleExecutionsApiResponse,
  totalCount: number,
): AdminScheduleExecutionsListResult {
  return {
    items: (data.items ?? []).map(mapScheduleExecutionFromApi),
    page: data.page,
    pageSize: data.page_size,
    total: totalCount || data.total,
  }
}

export function buildAdminJobsQuery(filters: AdminJobsFilters): string {
  return buildQueryString({
    page: filters.page,
    page_size: filters.pageSize,
    status: filters.status,
    tipo: filters.tipo,
    relatorio_id: filters.relatorioId,
    user_id: filters.userId,
    job_id: filters.jobId,
    created_from: filters.createdFrom,
    created_to: filters.createdTo,
    sort: 'created_at:desc',
  })
}

export function buildAdminScheduleExecutionsQuery(
  filters: AdminScheduleExecutionsFilters,
): string {
  return buildQueryString({
    page: filters.page,
    page_size: filters.pageSize,
    status: filters.status,
    relatorio_id: filters.relatorioId,
    created_from: filters.createdFrom,
    created_to: filters.createdTo,
    sort: 'iniciado_em:desc',
  })
}
