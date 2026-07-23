import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import type { ColumnDef, OnChangeFn, SortingState } from '@tanstack/react-table'
import DataGrid from '@/components/data-grid/DataGrid'
import { GRID_IDS } from '@/components/data-grid/grid-registry'
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
  total: number
  page: number
  pageSize: number
  totalPages: number
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  isLoading?: boolean
  isFetching?: boolean
  isRefreshing?: boolean
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
  total,
  page,
  pageSize,
  totalPages,
  sorting,
  onSortingChange,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  isFetching = false,
  isRefreshing = false,
  onStatusChange,
  onRelatorioIdChange,
  onDateRangeChange,
  onRefresh,
  onSelectJob,
}: ScheduledExecutionsTableProps) {
  const columns = useMemo<ColumnDef<AdminScheduleExecutionItem>[]>(
    () => [
      {
        id: 'relatorioNome',
        header: 'Relatório',
        accessorKey: 'relatorioNome',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.relatorioId ? (
            <Link
              to="/relatorios/$relatorioId/editar"
              params={{ relatorioId: String(row.original.relatorioId) }}
              className="text-vscode-accent hover:underline"
            >
              {row.original.relatorioNome ?? `Relatório #${row.original.relatorioId}`}
            </Link>
          ) : (
            '—'
          ),
      },
      {
        id: 'agendamentoNome',
        header: 'Agendamento',
        accessorKey: 'agendamentoNome',
        enableSorting: false,
        cell: ({ row }) => row.original.agendamentoNome,
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        enableSorting: false,
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        id: 'iniciadoEm',
        header: 'Início',
        accessorKey: 'iniciadoEm',
        enableSorting: true,
        cell: ({ row }) => formatReportDate(row.original.iniciadoEm),
      },
      {
        id: 'concluidoEm',
        header: 'Conclusão',
        accessorKey: 'concluidoEm',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.concluidoEm ? formatReportDate(row.original.concluidoEm) : '—',
      },
      {
        id: 'jobId',
        header: 'Job vinculado',
        accessorKey: 'jobId',
        enableSorting: false,
        meta: { stopRowClick: true },
        cell: ({ row }) =>
          row.original.jobId ? (
            <button
              type="button"
              className="font-mono text-xs text-vscode-accent hover:underline"
              title="Ver job"
              onClick={() => {
                if (onSelectJob) {
                  onSelectJob(row.original.jobId!)
                } else {
                  void copyToClipboard(row.original.jobId!)
                }
              }}
            >
              {truncateJobId(row.original.jobId)}
            </button>
          ) : (
            '—'
          ),
      },
      {
        id: 'erro',
        header: 'Detalhe',
        accessorKey: 'erro',
        enableSorting: false,
        cell: ({ row }) => row.original.erro ?? '—',
      },
    ],
    [onSelectJob],
  )

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

      <DataGrid
        gridId={GRID_IDS.adminScheduleExecutions}
        data={executions}
        columns={columns}
        getRowId={(row) => String(row.id)}
        paginationMode="server"
        pageIndex={page - 1}
        pageSize={pageSize}
        pageCount={totalPages}
        totalRows={total}
        onPaginationChange={(updater) => {
          const current = { pageIndex: page - 1, pageSize }
          const next = typeof updater === 'function' ? updater(current) : updater

          if (next.pageSize !== pageSize) {
            onPageSizeChange(next.pageSize)
            return
          }

          if (next.pageIndex !== page - 1) {
            onPageChange(next.pageIndex + 1)
          }
        }}
        enableSorting
        sortingMode="server"
        sorting={sorting}
        onSortingChange={onSortingChange}
        isLoading={isLoading}
        isFetching={isFetching}
        emptyMessage="Nenhuma execução agendada encontrada."
        showPagination
      />
    </div>
  )
}
