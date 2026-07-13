import type {
  SnapshotHistoryItem,
  SnapshotHistoryResponse,
} from '@/features/reports/report-snapshot-history-types'
import { apiRequest } from '@/lib/api-client'

type SnapshotHistoryApiRecord = SnapshotHistoryItem

type SnapshotHistoryApiResponse = {
  items: SnapshotHistoryApiRecord[]
}

function mapSnapshotHistoryItem(record: SnapshotHistoryApiRecord): SnapshotHistoryItem {
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
    userId: record.userId,
    userNome: record.userNome,
    origem: record.origem,
    parametros: record.parametros ?? {},
  }
}

export async function listReportSnapshotHistory(
  reportId: number,
): Promise<SnapshotHistoryResponse> {
  const data = await apiRequest<SnapshotHistoryApiResponse>(
    `/relatorios/${reportId}/snapshot/historico`,
  )

  return {
    items: (data.items ?? []).map(mapSnapshotHistoryItem),
  }
}

export function hasActiveSnapshotJobs(items: SnapshotHistoryItem[]): boolean {
  return items.some((item) => item.status === 'queued' || item.status === 'processing')
}
