import type { ReportJobStatus } from '@/features/reports/report-types'

export type SnapshotHistoryOrigem = 'manual' | 'agendado'

export type SnapshotHistoryItem = {
  jobId: string
  tipo: 'snapshot'
  status: ReportJobStatus
  progress: number
  relatorioId: number
  errorMessage: string | null
  downloadAvailable: boolean
  createdAt: string
  completedAt: string | null
  userId: number
  userNome: string
  origem: SnapshotHistoryOrigem
  parametros: Record<string, unknown>
}

export type SnapshotHistoryResponse = {
  items: SnapshotHistoryItem[]
}
