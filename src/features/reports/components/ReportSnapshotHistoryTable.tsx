import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatReportDate } from '@/features/reports/format-report-date'
import type { SnapshotHistoryItem } from '@/features/reports/report-snapshot-history-types'
import type { ReportJobStatus } from '@/features/reports/report-types'

type ReportSnapshotHistoryTableProps = {
  items: SnapshotHistoryItem[]
  isLoading?: boolean
  isRefreshing?: boolean
  onRefresh?: () => void
}

function origemBadge(origem: SnapshotHistoryItem['origem']) {
  if (origem === 'agendado') {
    return <Badge variant="warning">Agendado</Badge>
  }

  return <Badge variant="neutral">Manual</Badge>
}

function statusBadgeVariant(
  status: ReportJobStatus,
): 'success' | 'warning' | 'danger' | 'neutral' | 'info' {
  switch (status) {
    case 'completed':
      return 'success'
    case 'failed':
      return 'danger'
    case 'processing':
      return 'info'
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

function truncateJobId(jobId: string): string {
  if (jobId.length <= 12) {
    return jobId
  }

  return `${jobId.slice(0, 8)}…`
}

async function copyToClipboard(value: string): Promise<void> {
  await navigator.clipboard.writeText(value)
}

function renderDetail(item: SnapshotHistoryItem): string {
  if (item.errorMessage) {
    return item.errorMessage
  }

  if (item.status === 'processing' || item.status === 'queued') {
    return `${item.progress}%`
  }

  return '—'
}

export default function ReportSnapshotHistoryTable({
  items,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
}: ReportSnapshotHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-vscode-border px-6 py-12 text-sm text-vscode-text-muted">
        Carregando histórico...
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {onRefresh && (
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={onRefresh} loading={isRefreshing}>
            Atualizar
          </Button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-vscode-border bg-vscode-sidebar/40 px-6 py-12 text-sm text-vscode-text-muted">
          Nenhuma atualização de snapshot registrada ainda.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-vscode-border">
          <table className="min-w-full divide-y divide-vscode-border text-sm">
            <thead className="bg-vscode-sidebar/60">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Origem</th>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Status</th>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">
                  Solicitante
                </th>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Início</th>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">
                  Conclusão
                </th>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Job</th>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Detalhe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vscode-border bg-vscode-bg/40">
              {items.map((item) => (
                <tr key={item.jobId}>
                  <td className="px-4 py-3">{origemBadge(item.origem)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(item.status)}>
                      {statusLabel(item.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-vscode-text">
                    {item.userNome || `Usuário #${item.userId}`}
                  </td>
                  <td className="px-4 py-3 text-vscode-text">
                    {formatReportDate(item.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-vscode-text">
                    {item.completedAt ? formatReportDate(item.completedAt) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="font-mono text-xs text-vscode-accent hover:underline"
                      title="Copiar job ID"
                      onClick={() => void copyToClipboard(item.jobId)}
                    >
                      {truncateJobId(item.jobId)}
                    </button>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-vscode-text-muted">
                    {renderDetail(item)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
