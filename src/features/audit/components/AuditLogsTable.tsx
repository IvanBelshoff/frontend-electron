import { useMemo } from 'react'
import type { ColumnDef, OnChangeFn, SortingState } from '@tanstack/react-table'
import clsx from 'clsx'
import DataGrid from '@/components/data-grid/DataGrid'
import { GRID_IDS } from '@/components/data-grid/grid-registry'
import type { AuditLogListItem } from '@/features/audit/audit-types'
import {
  getAuditActionLabel,
  getAuditActorLabel,
  getAuditCategoryLabel,
  getAuditOutcomeLabel,
  getAuditResourceLabel,
} from '@/features/audit/audit-labels'
import { formatUserDate } from '@/features/user/format-user-date'

type AuditLogsTableProps = {
  logs: AuditLogListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  isLoading?: boolean
  isFetching?: boolean
  onRowClick: (log: AuditLogListItem) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  className?: string
}

function OutcomeBadge({ outcome }: { outcome: AuditLogListItem['outcome'] }) {
  return (
    <span
      className={clsx(
        'inline-flex rounded px-2 py-0.5 text-xs font-medium',
        outcome === 'success' && 'bg-emerald-500/15 text-emerald-400',
        outcome === 'failure' && 'bg-red-500/15 text-red-400',
        outcome === 'denied' && 'bg-amber-500/15 text-amber-400',
      )}
    >
      {getAuditOutcomeLabel(outcome)}
    </span>
  )
}

export default function AuditLogsTable({
  logs,
  total,
  page,
  pageSize,
  totalPages,
  sorting,
  onSortingChange,
  isLoading = false,
  isFetching = false,
  onRowClick,
  onPageChange,
  onPageSizeChange,
  className,
}: AuditLogsTableProps) {
  const columns = useMemo<ColumnDef<AuditLogListItem>[]>(
    () => [
      {
        id: 'criado_em',
        header: 'Data/hora',
        accessorKey: 'criado_em',
        enableSorting: true,
        cell: ({ row }) => formatUserDate(row.original.criado_em),
      },
      {
        id: 'actor_email',
        header: 'Ator',
        accessorKey: 'actor_email',
        enableSorting: true,
        cell: ({ row }) =>
          getAuditActorLabel(row.original.actor_type, row.original.actor_email),
      },
      {
        id: 'action',
        header: 'Ação',
        accessorKey: 'action',
        enableSorting: true,
        cell: ({ row }) => getAuditActionLabel(row.original.action),
      },
      {
        id: 'category',
        header: 'Categoria',
        accessorKey: 'category',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="rounded bg-vscode-input-bg px-2 py-0.5 text-xs text-vscode-text-muted">
            {getAuditCategoryLabel(row.original.category)}
          </span>
        ),
      },
      {
        id: 'outcome',
        header: 'Resultado',
        accessorKey: 'outcome',
        enableSorting: true,
        cell: ({ row }) => <OutcomeBadge outcome={row.original.outcome} />,
      },
      {
        id: 'resource_type',
        header: 'Recurso',
        accessorKey: 'resource_type',
        enableSorting: true,
        cell: ({ row }) =>
          getAuditResourceLabel(row.original.resource_type, row.original.resource_id),
      },
      {
        id: 'detalhes',
        header: '',
        enableSorting: false,
        enableResizing: false,
        meta: { lockPosition: 'end' },
        cell: () => <span className="text-xs text-vscode-accent">Detalhes</span>,
      },
    ],
    [],
  )

  return (
    <DataGrid
      gridId={GRID_IDS.auditLogs}
      data={logs}
      columns={columns}
      getRowId={(row) => row.id}
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
      emptyMessage="Nenhum log de auditoria encontrado para os filtros selecionados."
      onRowClick={onRowClick}
      showPagination
      className={className}
    />
  )
}
