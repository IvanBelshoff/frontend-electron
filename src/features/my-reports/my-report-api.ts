import {
  mapReportFromApi,
  mapReportListFromApi,
  type ReportApiRecord,
} from '@/features/reports/report-mapper'
import type {
  ReportDataQueryParams,
  ReportDataResult,
  ReportExecutionParams,
  ReportStatusResult,
} from '@/features/reports/report-types'
import type { Report } from '@/features/reports/report-types'
import type {
  ListMyReportsParams,
  MyReportListResult,
} from '@/features/my-reports/my-report-types'
import { apiRequest, apiRequestWithResponse } from '@/lib/api-client'

type MyReportsApiResponse = {
  data: ReportApiRecord[]
  favoritos: number[]
}

type ReportDataApiRecord = {
  estado?: string
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
  estado: string
  snapshot_atualizado_em?: string | null
  snapshot_valido: boolean
  erro_ultima_geracao?: string | null
}

function buildMyReportsQuery(params: ListMyReportsParams): string {
  const searchParams = new URLSearchParams()

  searchParams.set('page', String(params.page ?? 1))
  searchParams.set('limit', String(params.limit ?? 50))

  if (params.nome) {
    searchParams.set('nome', params.nome)
  }

  if (params.favoritos) {
    searchParams.set('favoritos', 'true')
  }

  if (params.privacidade) {
    searchParams.set('privacidade', params.privacidade)
  }

  if (params.temporario !== undefined) {
    searchParams.set('temporario', String(params.temporario))
  }

  if (params.sort) {
    searchParams.set('sort', params.sort)
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

function mapReportDataFromApi(record: ReportDataApiRecord): ReportDataResult {
  return {
    estado: record.estado as ReportDataResult['estado'],
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
    estado: record.estado as ReportStatusResult['estado'],
    snapshotAtualizadoEm: record.snapshot_atualizado_em,
    snapshotValido: record.snapshot_valido,
    erroUltimaGeracao: record.erro_ultima_geracao,
  }
}

export async function listMyReports(
  params: ListMyReportsParams = {},
): Promise<MyReportListResult> {
  const query = buildMyReportsQuery(params)
  const { data, response } = await apiRequestWithResponse<MyReportsApiResponse>(
    `/relatorios/private?${query}`,
  )

  return {
    items: mapReportListFromApi(data.data),
    favoriteIds: (data.favoritos ?? []).map(Number),
    totalCount: parseTotalCount(response.headers.get('x-total-count')),
  }
}

export async function getMyReport(id: number): Promise<Report> {
  const data = await apiRequest<ReportApiRecord>(`/relatorios/private/${id}`)
  return mapReportFromApi(data)
}

export async function updateMyReportFavorites(
  userId: number,
  favoritos: number[],
): Promise<void> {
  await apiRequest<void>(`/user/relatorios/favorites/${userId}`, {
    method: 'PATCH',
    body: { favoritos },
  })
}

export async function getMyReportData(
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

  if (queryParams.sort) {
    searchParams.set('sort', queryParams.sort)
  }

  const data = await apiRequest<ReportDataApiRecord>(
    `/relatorios/${id}/dados?${searchParams.toString()}`,
  )
  return mapReportDataFromApi(data)
}

export async function getMyReportStatus(id: number): Promise<ReportStatusResult> {
  const data = await apiRequest<ReportStatusApiRecord>(`/relatorios/${id}/status`)
  return mapReportStatusFromApi(data)
}

export async function executeMyReport(
  id: number,
  parametros: ReportExecutionParams = {},
): Promise<ReportDataResult> {
  const data = await apiRequest<ReportDataApiRecord>(`/relatorios/${id}/executar`, {
    method: 'POST',
    body: { parametros },
  })

  return mapReportDataFromApi(data)
}

export {
  downloadReportExport,
  exportReport,
  getReportJobStatus,
} from '@/features/reports/report-job-api'
