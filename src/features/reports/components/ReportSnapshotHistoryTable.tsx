import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import DataGrid from '@/components/data-grid/DataGrid'
import { GRID_IDS } from '@/components/data-grid/grid-registry'
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
  const columns = useMemo<ColumnDef<SnapshotHistoryItem>[]>(
    () => [
      {
        id: 'origem',
        header: 'Origem',
        accessorKey: 'origem',
        enableSorting: true,
        cell: ({ row }) => origemBadge(row.original.origem),
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        enableSorting: true,
        cell: ({ row }) => (
          <Badge variant={statusBadgeVariant(row.original.status)}>
            {statusLabel(row.original.status)}
          </Badge>
        ),
      },
      {
        id: 'userNome',
        header: 'Solicitante',
        accessorKey: 'userNome',
        enableSorting: true,
        cell: ({ row }) => row.original.userNome || `Usuário #${row.original.userId}`,
      },
      {
        id: 'createdAt',
        header: 'Início',
        accessorKey: 'createdAt',
        enableSorting: true,
        cell: ({ row }) => formatReportDate(row.original.createdAt),
      },
      {
        id: 'completedAt',
        header: 'Conclusão',
        accessorKey: 'completedAt',
        enableSorting: true,
        cell: ({ row }) =>
          row.original.completedAt ? formatReportDate(row.original.completedAt) : '—',
      },
      {
        id: 'jobId',
        header: 'Job',
        accessorKey: 'jobId',
        enableSorting: false,
        meta: { stopRowClick: true },
        cell: ({ row }) => (
          <button
            type="button"
            className="font-mono text-xs text-vscode-accent hover:underline"
            title="Copiar job ID"
            onClick={() => void copyToClipboard(row.original.jobId)}
          >
            {truncateJobId(row.original.jobId)}
          </button>
        ),
      },
      {
        id: 'detalhe',
        header: 'Detalhe',
        enableSorting: false,
        cell: ({ row }) => renderDetail(row.original),
      },
    ],
    [],
  )

  return (
    <div className="space-y-3">
      {onRefresh && (
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={onRefresh} loading={isRefreshing}>
            Atualizar
          </Button>
        </div>
      )}

      <DataGrid
        gridId={GRID_IDS.reportSnapshotHistory}
        data={items}
        columns={columns}
        getRowId={(row) => row.jobId}
        enableSorting
        sortingMode="client"
        isLoading={isLoading}
        isFetching={isRefreshing}
        emptyMessage="Nenhuma atualização de snapshot registrada ainda."
      />
    </div>
  )
}
