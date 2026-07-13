import { Link } from '@tanstack/react-router'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FilterOptionButton } from '@/features/dashboards/icons/DashboardIcons'
import type { AdminScheduleExecutionItem, AdminScheduleExecutionsFilters } from '@/features/jobs/jobs-types'
import { formatReportDate } from '@/features/reports/format-report-date'
import type { AgendamentoExecucaoStatus } from '@/features/reports/report-schedule-types'
import { dayEndIso, dayStartIso, toDateInputValue } from '@/lib/datetime'

type ScheduledExecutionsTableProps = {
  executions: AdminScheduleExecutionItem[]
  filters: AdminScheduleExecutionsFilters
  isLoading?: boolean
  isRefreshing?: boolean
  total: number
  onStatusChange: (status?: AgendamentoExecucaoStatus) => void
  onRelatorioIdChange: (relatorioId?: number) => void
  onDateRangeChange: (createdFrom?: string, createdTo?: string) => void
  onRefresh: () => void
  onSelectJob?: (jobId: string) => void
}

const STATUS_OPTIONS: Array<{ value?: AgendamentoExecucaoStatus; label: string }> = [
  { label: 'Todos' },
  { value: 'started', label: 'Em andamento' },
  { value: 'completed', label: 'Concluído' },
  { value: 'failed', label: 'Falhou' },
  { value: 'skipped', label: 'Ignorado' },
]

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

export default function ScheduledExecutionsTable({
  executions,
  filters,
  isLoading = false,
  isRefreshing = false,
  total,
  onStatusChange,
  onRelatorioIdChange,
  onDateRangeChange,
  onRefresh,
  onSelectJob,
}: ScheduledExecutionsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-vscode-border px-6 py-12 text-sm text-vscode-text-muted">
        Carregando execuções agendadas...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-lg border border-vscode-border bg-vscode-sidebar/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-vscode-text-muted">
            {total} execução{total === 1 ? '' : 'ões'} encontrada{total === 1 ? '' : 's'}
          </p>
          <Button variant="secondary" size="sm" onClick={onRefresh} loading={isRefreshing}>
            Atualizar
          </Button>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[140px]">
            <label className="mb-1 block text-xs font-medium text-vscode-text">Relatório ID</label>
            <Input
              type="number"
              min={1}
              value={filters.relatorioId ?? ''}
              onChange={(event) => {
                const value = event.target.value
                onRelatorioIdChange(value ? Number(value) : undefined)
              }}
              placeholder="ID"
            />
          </div>

          <div className="min-w-[150px]">
            <label className="mb-1 block text-xs font-medium text-vscode-text">De</label>
            <Input
              type="date"
              value={toDateInputValue(filters.createdFrom)}
              onChange={(event) =>
                onDateRangeChange(
                  event.target.value ? dayStartIso(event.target.value) : undefined,
                  filters.createdTo,
                )
              }
            />
          </div>

          <div className="min-w-[150px]">
            <label className="mb-1 block text-xs font-medium text-vscode-text">Até</label>
            <Input
              type="date"
              value={toDateInputValue(filters.createdTo)}
              onChange={(event) =>
                onDateRangeChange(
                  filters.createdFrom,
                  event.target.value ? dayEndIso(event.target.value) : undefined,
                )
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="block text-xs font-medium text-vscode-text">Status</span>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <FilterOptionButton
                key={option.label}
                active={filters.status === option.value}
                onClick={() => onStatusChange(option.value)}
              >
                {option.label}
              </FilterOptionButton>
            ))}
          </div>
        </div>
      </div>

      {executions.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-vscode-border bg-vscode-sidebar/40 px-6 py-12 text-sm text-vscode-text-muted">
          Nenhuma execução agendada encontrada.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-vscode-border">
          <table className="min-w-full divide-y divide-vscode-border text-sm">
            <thead className="bg-vscode-sidebar/60">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Relatório</th>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Agendamento</th>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Status</th>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Início</th>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Conclusão</th>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Job vinculado</th>
                <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Detalhe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vscode-border bg-vscode-bg/40">
              {executions.map((execution) => (
                <tr key={execution.id}>
                  <td className="px-4 py-3">
                    {execution.relatorioId ? (
                      <Link
                        to="/relatorios/$relatorioId/editar"
                        params={{ relatorioId: String(execution.relatorioId) }}
                        className="text-vscode-accent hover:underline"
                      >
                        {execution.relatorioNome ?? `Relatório #${execution.relatorioId}`}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-vscode-text">{execution.agendamentoNome}</td>
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
                        title="Ver job"
                        onClick={() => {
                          if (onSelectJob) {
                            onSelectJob(execution.jobId!)
                          } else {
                            void copyToClipboard(execution.jobId!)
                          }
                        }}
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
