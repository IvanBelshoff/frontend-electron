import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import type { ColumnDef, OnChangeFn, SortingState } from '@tanstack/react-table'
import DataGrid from '@/components/data-grid/DataGrid'
import { GRID_IDS } from '@/components/data-grid/grid-registry'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { AdminJobListItem } from '@/features/jobs/jobs-types'
import { formatReportDate } from '@/features/reports/format-report-date'
import ReportJobProgress from '@/features/reports/components/ReportJobProgress'
import type { ReportJobStatus, ReportJobTipo } from '@/features/reports/report-types'

type JobsTableProps = {
  jobs: AdminJobListItem[]
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
  onViewDetail: (job: AdminJobListItem) => void
  onDownload: (jobId: string) => void
  isDownloading?: boolean
  downloadingJobId?: string | null
}

function tipoBadge(tipo: ReportJobTipo) {
  if (tipo === 'export_csv') {
    return <Badge variant="info">Export CSV</Badge>
  }

  return <Badge variant="neutral">Snapshot</Badge>
}

function origemBadge(origem: AdminJobListItem['origem']) {
  if (origem === 'agendado') {
    return <Badge variant="warning">Agendado</Badge>
  }

  return <Badge variant="neutral">Manual</Badge>
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

export default function JobsTable({
  jobs,
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
  onViewDetail,
  onDownload,
  isDownloading = false,
  downloadingJobId = null,
}: JobsTableProps) {
  const columns = useMemo<ColumnDef<AdminJobListItem>[]>(
    () => [
      {
        id: 'tipo',
        header: 'Tipo',
        accessorKey: 'tipo',
        enableSorting: false,
        cell: ({ row }) => tipoBadge(row.original.tipo),
      },
      {
        id: 'relatorioNome',
        header: 'Relatório',
        accessorKey: 'relatorioNome',
        enableSorting: false,
        size: 280,
        cell: ({ row }) => (
          <Link
            to="/relatorios/$relatorioId/editar"
            params={{ relatorioId: String(row.original.relatorioId) }}
            className="min-w-0 break-words leading-snug text-vscode-accent hover:underline"
          >
            {row.original.relatorioNome}
          </Link>
        ),
      },
      {
        id: 'userNome',
        header: 'Solicitante',
        accessorKey: 'userNome',
        enableSorting: false,
        cell: ({ row }) => row.original.userNome || `Usuário #${row.original.userId}`,
      },
      {
        id: 'origem',
        header: 'Origem',
        accessorKey: 'origem',
        enableSorting: false,
        cell: ({ row }) => origemBadge(row.original.origem),
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant={statusBadgeVariant(row.original.status)}>
            {statusLabel(row.original.status)}
          </Badge>
        ),
      },
      {
        id: 'progress',
        header: 'Progresso',
        enableSorting: false,
        size: 200,
        cell: ({ row }) =>
          row.original.status === 'processing' || row.original.status === 'queued' ? (
            <ReportJobProgress
              status={row.original.status}
              progress={row.original.progress}
              tipo={row.original.tipo}
              errorMessage={row.original.errorMessage}
            />
          ) : (
            <span className="text-vscode-text-muted">—</span>
          ),
      },
      {
        id: 'createdAt',
        header: 'Criado em',
        accessorKey: 'createdAt',
        enableSorting: true,
        cell: ({ row }) => formatReportDate(row.original.createdAt),
      },
      {
        id: 'completedAt',
        header: 'Concluído em',
        accessorKey: 'completedAt',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.completedAt ? formatReportDate(row.original.completedAt) : '—',
      },
      {
        id: 'acoes',
        header: 'Ações',
        enableSorting: false,
        enableResizing: false,
        meta: { lockPosition: 'end', stopRowClick: true },
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => onViewDetail(row.original)}>
              Detalhe
            </Button>
            {row.original.downloadAvailable && (
              <Button
                variant="secondary"
                size="sm"
                loading={isDownloading && downloadingJobId === row.original.jobId}
                onClick={() => onDownload(row.original.jobId)}
              >
                Download
              </Button>
            )}
          </div>
        ),
      },
    ],
    [downloadingJobId, isDownloading, onDownload, onViewDetail],
  )

  return (
    <DataGrid
      gridId={GRID_IDS.adminJobs}
      data={jobs}
      columns={columns}
      getRowId={(row) => row.jobId}
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
      emptyMessage="Nenhum job encontrado para os filtros selecionados."
      showPagination
    />
  )
}
