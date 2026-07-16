import {
  mapReportFromApi,
  mapReportListFromApi,
  mapReportToCreateApi,
  mapReportToUpdateApi,
  type ReportApiRecord,
} from '@/features/reports/report-mapper'
import type {
  CreateReportInput,
  EstadoRelatorio,
  Report,
  ReportDataQueryParams,
  ReportDataResult,
  ReportExecutionParams,
  ReportStatusResult,
  SnapshotRefreshResponse,
  UpdateReportInput,
} from '@/features/reports/report-types'
import type {
  AccessUser,
  DashboardAccessLists,
  DashboardAccessListsApiRecord,
} from '@/features/user/user-types'
import { apiRequest, apiRequestWithResponse } from '@/lib/api-client'

export type ListReportsParams = {
  page?: number
  limit?: number
  nome?: string
  id_criador?: string
  visivel?: boolean
  privacidade?: 'privado' | 'publico'
  temporario?: boolean
  expiracao?: string
  estado?: EstadoRelatorio
}

export type ListReportsResult = {
  items: Report[]
  totalCount: number
}

export type ReportFiltersResult = {
  nomes: string[]
  nomesCount: number
  ids_criador: number[]
  ids_criadorCount: number
  estados: EstadoRelatorio[]
  estadosCount: number
}

type ReportDataApiRecord = {
  estado?: EstadoRelatorio
  colunas: string[]
  dados: Record<string, unknown>[]
  total_linhas: number
  page?: number
  page_size?: number
  snapshot_atualizado_em?: string | null
  snapshot_valido?: boolean
  parametros_utilizados?: Record<string, unknown>
}

type ReportStatusApiRecord = {
  estado: EstadoRelatorio
  snapshot_atualizado_em?: string | null
  snapshot_valido: boolean
  erro_ultima_geracao?: string | null
}

function buildReportsQuery(params: ListReportsParams): string {
  const searchParams = new URLSearchParams()

  searchParams.set('page', String(params.page ?? 1))
  searchParams.set('limit', String(params.limit ?? 100))

  if (params.nome) {
    searchParams.set('nome', params.nome)
  }

  if (params.id_criador) {
    searchParams.set('id_criador', params.id_criador)
  }

  if (params.visivel !== undefined) {
    searchParams.set('visivel', String(params.visivel))
  }

  if (params.privacidade) {
    searchParams.set('privacidade', params.privacidade)
  }

  if (params.temporario !== undefined) {
    searchParams.set('temporario', String(params.temporario))
  }

  if (params.expiracao) {
    searchParams.set('expiracao', params.expiracao)
  }

  if (params.estado) {
    searchParams.set('estado', params.estado)
  }

  return searchParams.toString()
}

function parseTotalCount(headerValue: string | null): number {
  if (!headerValue) {
    return 0
  }

  const parsed = Number(headerValue)
  return Number.isFinite(parsed) ? parsed : 0
}

function mapAccessUserFromApi(record: {
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
  permitir_conhecimento_ia?: boolean
  permitirConhecimentoIa?: boolean
}): AccessUser {
  return {
    id: Number(record.id),
    nome: record.nome,
    sobrenome: record.sobrenome,
    foto: record.foto
      ? {
          id: Number(record.foto.id),
          nome: record.foto.nome,
          local: record.foto.local,
          type: record.foto.type ?? record.foto.tipo,
        }
      : null,
    permitirConhecimentoIa:
      record.permitirConhecimentoIa ?? record.permitir_conhecimento_ia ?? false,
  }
}

function mapReportAccessListsFromApi(
  record: DashboardAccessListsApiRecord,
): DashboardAccessLists {
  return {
    usuarios: record.usuarios.map(mapAccessUserFromApi),
    usuariosDisponiveis: record.usuariosDisponiveis.map(mapAccessUserFromApi),
  }
}

function mapReportDataFromApi(record: ReportDataApiRecord): ReportDataResult {
  return {
    estado: record.estado,
    colunas: record.colunas,
    dados: record.dados,
    totalLinhas: record.total_linhas,
    page: record.page,
    pageSize: record.page_size,
    snapshotAtualizadoEm: record.snapshot_atualizado_em,
    snapshotValido: record.snapshot_valido,
    parametrosUtilizados: record.parametros_utilizados,
  }
}

function mapReportStatusFromApi(record: ReportStatusApiRecord): ReportStatusResult {
  return {
    estado: record.estado,
    snapshotAtualizadoEm: record.snapshot_atualizado_em,
    snapshotValido: record.snapshot_valido,
    erroUltimaGeracao: record.erro_ultima_geracao,
  }
}

export async function listReports(params: ListReportsParams = {}): Promise<ListReportsResult> {
  const query = buildReportsQuery(params)
  const { data, response } = await apiRequestWithResponse<ReportApiRecord[]>(
    `/relatorios?${query}`,
  )

  return {
    items: mapReportListFromApi(data),
    totalCount: parseTotalCount(response.headers.get('x-total-count')),
  }
}

export async function getReport(id: number): Promise<Report> {
  const data = await apiRequest<ReportApiRecord>(`/relatorios/${id}`)
  return mapReportFromApi(data)
}

export async function createReport(input: CreateReportInput): Promise<Report> {
  const data = await apiRequest<ReportApiRecord>('/relatorios', {
    method: 'POST',
    body: mapReportToCreateApi(input),
  })

  return mapReportFromApi(data)
}

export async function updateReport(id: number, input: UpdateReportInput): Promise<Report> {
  const data = await apiRequest<ReportApiRecord>(`/relatorios/${id}`, {
    method: 'PATCH',
    body: mapReportToUpdateApi(input),
  })

  return mapReportFromApi(data)
}

export async function deleteReport(id: number): Promise<void> {
  await apiRequest<void>(`/relatorios/${id}`, { method: 'DELETE' })
}

export async function getReportFilters(
  params: ListReportsParams = {},
): Promise<ReportFiltersResult> {
  const query = buildReportsQuery(params)
  return apiRequest<ReportFiltersResult>(`/relatorios/filters?${query}`)
}

export async function getReportStatus(id: number): Promise<ReportStatusResult> {
  const data = await apiRequest<ReportStatusApiRecord>(`/relatorios/${id}/status`)
  return mapReportStatusFromApi(data)
}

export async function getReportData(
  id: number,
  queryParams: ReportDataQueryParams = {},
): Promise<ReportDataResult> {
  const searchParams = new URLSearchParams()
  const page = queryParams.page ?? 1
  const pageSize = queryParams.pageSize ?? 50

  searchParams.set('page', String(page))
  searchParams.set('page_size', String(pageSize))

  if (queryParams.parametros && Object.keys(queryParams.parametros).length > 0) {
    searchParams.set('parametros', JSON.stringify(queryParams.parametros))
  }

  const data = await apiRequest<ReportDataApiRecord>(
    `/relatorios/${id}/dados?${searchParams.toString()}`,
  )
  return mapReportDataFromApi(data)
}

export async function executeReport(
  id: number,
  parametros: ReportExecutionParams = {},
): Promise<ReportDataResult> {
  const data = await apiRequest<ReportDataApiRecord>(`/relatorios/${id}/executar`, {
    method: 'POST',
    body: { parametros },
  })

  return mapReportDataFromApi(data)
}

export async function refreshReportSnapshot(
  id: number,
  parametrosSnapshot: Record<string, unknown> = {},
): Promise<SnapshotRefreshResponse> {
  return apiRequest<SnapshotRefreshResponse>(`/relatorios/${id}/snapshot/atualizar`, {
    method: 'POST',
    body: { parametros_snapshot: parametrosSnapshot },
  })
}

export {
  downloadReportExport,
  exportReport,
  getReportJobStatus,
} from '@/features/reports/report-job-api'

export type ReportUserAccessGrant = {
  id: number
  permitirConhecimentoIa?: boolean
}

export async function assignReportUsers(
  id: number,
  usuarios: ReportUserAccessGrant[],
): Promise<void> {
  await apiRequest<void>(`/relatorios/users/${id}`, {
    method: 'PATCH',
    body: { usuarios },
  })
}

export async function getUsersByReport(reportId: number): Promise<DashboardAccessLists> {
  const data = await apiRequest<DashboardAccessListsApiRecord>(
    `/user/relatorios/${reportId}`,
  )

  return mapReportAccessListsFromApi(data)
}
