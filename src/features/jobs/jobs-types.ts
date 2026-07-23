import type { ReportJobStatus, ReportJobTipo } from '@/features/reports/report-types'
import type { AgendamentoExecucaoStatus } from '@/features/reports/report-schedule-types'

export type JobOrigem = 'manual' | 'agendado'

export type AdminJobListItem = {
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

export type AdminJobsListResult = {
  items: AdminJobListItem[]
  page: number
  pageSize: number
  total: number
}

export type AdminJobsFilters = {
  page: number
  pageSize: number
  status?: ReportJobStatus
  tipo?: ReportJobTipo
  relatorioId?: number
  userId?: number
  jobId?: string
  createdFrom?: string
  createdTo?: string
  sort?: string
}

export type AdminScheduleExecutionItem = {
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

export type AdminScheduleExecutionsListResult = {
  items: AdminScheduleExecutionItem[]
  page: number
  pageSize: number
  total: number
}

export type AdminScheduleExecutionsFilters = {
  page: number
  pageSize: number
  status?: AgendamentoExecucaoStatus
  relatorioId?: number
  createdFrom?: string
  createdTo?: string
  sort?: string
}

export type JobsPageTab = 'jobs' | 'schedules'
