import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import clsx from 'clsx'
import DataGrid from '@/components/data-grid/DataGrid'
import type { AuditLogItem } from '@/features/audit/audit-types'
import {
  getAuditActionLabel,
  getAuditActorLabel,
  getAuditCategoryLabel,
  getAuditOutcomeLabel,
  getAuditResourceLabel,
} from '@/features/audit/audit-labels'
import { formatUserDate } from '@/features/user/format-user-date'

type AuditLogsTableProps = {
  logs: AuditLogItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  isLoading?: boolean
  isFetching?: boolean
  onRowClick: (log: AuditLogItem) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  className?: string
}

function OutcomeBadge({ outcome }: { outcome: AuditLogItem['outcome'] }) {
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
  isLoading = false,
  isFetching = false,
  onRowClick,
  onPageChange,
  onPageSizeChange,
  className,
}: AuditLogsTableProps) {
  const columns = useMemo<ColumnDef<AuditLogItem>[]>(
    () => [
      {
        id: 'criado_em',
        header: 'Data/hora',
        accessorKey: 'criado_em',
        cell: ({ row }) => formatUserDate(row.original.criado_em),
      },
      {
        id: 'ator',
        header: 'Ator',
        cell: ({ row }) =>
          getAuditActorLabel(row.original.actor_type, row.original.actor_email),
      },
      {
        id: 'acao',
        header: 'Ação',
        accessorKey: 'action',
        cell: ({ row }) => getAuditActionLabel(row.original.action),
      },
      {
        id: 'categoria',
        header: 'Categoria',
        accessorKey: 'category',
        cell: ({ row }) => (
          <span className="rounded bg-vscode-input-bg px-2 py-0.5 text-xs text-vscode-text-muted">
            {getAuditCategoryLabel(row.original.category)}
          </span>
        ),
      },
      {
        id: 'resultado',
        header: 'Resultado',
        accessorKey: 'outcome',
        cell: ({ row }) => <OutcomeBadge outcome={row.original.outcome} />,
      },
      {
        id: 'recurso',
        header: 'Recurso',
        cell: ({ row }) =>
          getAuditResourceLabel(row.original.resource_type, row.original.resource_id),
      },
      {
        id: 'detalhes',
        header: '',
        cell: () => (
          <span className="text-xs text-vscode-accent">Detalhes</span>
        ),
      },
    ],
    [],
  )

  return (
    <DataGrid
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
      isLoading={isLoading}
      isFetching={isFetching}
      emptyMessage="Nenhum log de auditoria encontrado para os filtros selecionados."
      onRowClick={onRowClick}
      rowHeight={36}
      stickyHeader
      showGridLines
      showPagination
      className={className}
    />
  )
}
