import type {
  ExportReportResponse,
  ReportExecutionParams,
  ReportJobStatus,
  ReportJobStatusResult,
  ReportJobTipo,
} from '@/features/reports/report-types'
import { apiRequest, apiRequestBlob } from '@/lib/api-client'

type ReportJobStatusApiRecord = {
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

function mapReportJobStatusFromApi(
  record: ReportJobStatusApiRecord,
): ReportJobStatusResult {
  return {
    jobId: record.jobId,
    tipo: record.tipo,
    status: record.status,
    progress: record.progress,
    relatorioId: record.relatorioId,
    errorMessage: record.errorMessage,
    downloadAvailable: record.downloadAvailable,
    createdAt: record.createdAt,
    completedAt: record.completedAt,
  }
}

export async function exportReport(
  reportId: number,
  parametros: ReportExecutionParams = {},
): Promise<ExportReportResponse> {
  return apiRequest<ExportReportResponse>(`/relatorios/${reportId}/exportar`, {
    method: 'POST',
    body: { parametros, formato: 'csv' },
  })
}

export async function getReportJobStatus(jobId: string): Promise<ReportJobStatusResult> {
  const data = await apiRequest<ReportJobStatusApiRecord>(`/relatorios/jobs/${jobId}`)
  return mapReportJobStatusFromApi(data)
}

export async function downloadReportExport(jobId: string): Promise<{
  blob: Blob
  filename: string
}> {
  const { blob, filename } = await apiRequestBlob(`/relatorios/jobs/${jobId}/download`)

  return {
    blob,
    filename: filename ?? `relatorio-export-${jobId}.csv`,
  }
}
