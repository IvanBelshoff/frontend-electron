import Badge from '@/components/ui/Badge'
import type { ReportJobStatus, ReportJobTipo } from '@/features/reports/report-types'

type ReportJobProgressProps = {
  status: ReportJobStatus
  progress: number
  tipo: ReportJobTipo
  errorMessage?: string | null
}

function statusBadgeVariant(
  status: ReportJobStatus,
): 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'completed':
      return 'success'
    case 'failed':
      return 'danger'
    case 'processing':
    case 'queued':
      return 'warning'
    default:
      return 'neutral'
  }
}

function statusLabel(status: ReportJobStatus): string {
  switch (status) {
    case 'queued':
      return 'Na fila'
    case 'processing':
      return 'Processando'
    case 'completed':
      return 'Concluído'
    case 'failed':
      return 'Falhou'
    default:
      return status
  }
}

function progressLabel(tipo: ReportJobTipo, status: ReportJobStatus, progress: number): string {
  if (status === 'failed') {
    return 'Operação falhou.'
  }

  if (status === 'completed') {
    return tipo === 'export_csv' ? 'Exportação concluída.' : 'Snapshot concluído.'
  }

  if (status === 'queued') {
    return tipo === 'export_csv' ? 'Exportação na fila...' : 'Snapshot na fila...'
  }

  const action = tipo === 'export_csv' ? 'Exportando' : 'Gerando snapshot'
  return `${action}... ${progress}%`
}

export default function ReportJobProgress({
  status,
  progress,
  tipo,
  errorMessage,
}: ReportJobProgressProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className="w-full space-y-2" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusBadgeVariant(status)}>{statusLabel(status)}</Badge>
        <span className="text-xs text-vscode-text-muted">
          {progressLabel(tipo, status, clampedProgress)}
        </span>
      </div>

      {status !== 'failed' && status !== 'completed' && (
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-vscode-border"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clampedProgress}
        >
          <div
            className="h-full rounded-full bg-vscode-accent transition-[width] duration-300"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      )}

      {status === 'failed' && errorMessage && (
        <p className="text-xs text-red-400">{errorMessage}</p>
      )}
    </div>
  )
}
