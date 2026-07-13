import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatReportDate } from '@/features/reports/format-report-date'
import type { AgendamentoExecucao, AgendamentoExecucaoStatus } from '@/features/reports/report-schedule-types'

type ReportScheduleExecutionsTableProps = {
  executions: AgendamentoExecucao[]
  isLoading?: boolean
  isRefreshing?: boolean
  onRefresh?: () => void
}

function getStatusBadge(status: AgendamentoExecucaoStatus) {
  switch (status) {
    case 'completed':
      return <Badge variant="success">Concluído</Badge>
    case 'failed':
      return <Badge variant="danger">Falhou</Badge>
    case 'skipped':
      return <Badge variant="warning">Ignorado</Badge>
    case 'started':
      return <Badge variant="info">Em andamento</Badge>
    default:
      return <Badge variant="neutral">{status}</Badge>
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

export default function ReportScheduleExecutionsTable({
  executions,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
}: ReportScheduleExecutionsTableProps) {
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

      {executions.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-vscode-border bg-vscode-sidebar/40 px-6 py-12 text-sm text-vscode-text-muted">
          Nenhuma execução registrada ainda.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-vscode-border">
          <table className="min-w-full divide-y divide-vscode-border text-sm">
            <thead className="bg-vscode-sidebar/60">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Status</th>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Início</th>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Conclusão</th>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Job</th>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Detalhe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vscode-border bg-vscode-bg/40">
              {executions.map((execution) => (
                <tr key={execution.id}>
                  <td className="px-4 py-3">{getStatusBadge(execution.status)}</td>
                  <td className="px-4 py-3 text-vscode-text">
                    {formatReportDate(execution.iniciadoEm)}
                  </td>
                  <td className="px-4 py-3 text-vscode-text">
                    {execution.concluidoEm ? formatReportDate(execution.concluidoEm) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {execution.jobId ? (
                      <button
                        type="button"
                        className="font-mono text-xs text-vscode-accent hover:underline"
                        title="Copiar job ID"
                        onClick={() => void copyToClipboard(execution.jobId!)}
                      >
                        {truncateJobId(execution.jobId)}
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-vscode-text-muted">
                    {execution.erro ?? '—'}
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
