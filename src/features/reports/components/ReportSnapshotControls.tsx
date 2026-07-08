import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatReportDate } from '@/features/reports/format-report-date'
import type { EstadoRelatorio } from '@/features/reports/report-types'

type ReportSnapshotControlsProps = {
  estado: EstadoRelatorio
  snapshotValido: boolean
  snapshotAtualizadoEm?: string | null
  onRefresh: () => void
  isRefreshing?: boolean
}

function RefreshIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </svg>
  )
}

function ValidSnapshotIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function InvalidSnapshotIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export default function ReportSnapshotControls({
  estado,
  snapshotValido,
  snapshotAtualizadoEm,
  onRefresh,
  isRefreshing = false,
}: ReportSnapshotControlsProps) {
  const isGenerating = estado === 'gerando_snapshot'

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="secondary"
        size="sm"
        onClick={onRefresh}
        loading={isRefreshing || isGenerating}
        disabled={isGenerating}
      >
        <RefreshIcon />
        Atualizar snapshot
      </Button>

      <Badge
        variant={snapshotValido ? 'success' : 'danger'}
        icon={snapshotValido ? <ValidSnapshotIcon /> : <InvalidSnapshotIcon />}
      >
        {snapshotValido ? 'Snapshot válido' : 'Snapshot inválido'}
      </Badge>

      {snapshotAtualizadoEm && (
        <span className="text-xs text-vscode-text-muted">
          Atualizado em {formatReportDate(snapshotAtualizadoEm)}
        </span>
      )}

      {isGenerating && (
        <p className="w-full text-xs text-vscode-text-muted">
          Snapshot em geração. A página será atualizada automaticamente enquanto o status for
          monitorado.
        </p>
      )}
    </div>
  )
}
