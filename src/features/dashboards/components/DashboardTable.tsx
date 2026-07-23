import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import DataGrid from '@/components/data-grid/DataGrid'
import { GRID_IDS } from '@/components/data-grid/grid-registry'
import IconButton from '@/components/ui/IconButton'
import DashboardEmptyState from '@/features/dashboards/components/DashboardEmptyState'
import DashboardStatusBadges from '@/features/dashboards/components/DashboardStatusBadges'
import type { Dashboard } from '@/features/dashboards/dashboard-types'
import { formatDashboardDate } from '@/features/dashboards/format-dashboard-date'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DashboardMaterialIcon,
  PencilIcon,
  TrashIcon,
} from '@/features/dashboards/icons/DashboardIcons'

type DashboardTableProps = {
  dashboards: Dashboard[]
  onEdit: (dashboard: Dashboard) => void
  onDelete: (dashboard: Dashboard) => void
  onClearFilters: () => void
  canEdit?: boolean
  canDelete?: boolean
}

function DashboardTableDetailsRow({ dashboard }: { dashboard: Dashboard }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-2 text-xs text-vscode-text-muted sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2">
      <p className="min-w-0 break-words">
        <strong className="font-semibold text-vscode-text-muted">Criado por:</strong>{' '}
        {dashboard.usuarioCadastrador || 'Não informado'}
      </p>
      <p className="min-w-0 break-words">
        <strong className="font-semibold text-vscode-text-muted">Data de criação:</strong>{' '}
        {formatDashboardDate(dashboard.dataCriacao)}
      </p>
      <p className="min-w-0 break-words">
        <strong className="font-semibold text-vscode-text-muted">Atualizado por:</strong>{' '}
        {dashboard.usuarioAtualizador || 'Não informado'}
      </p>
      <p className="min-w-0 break-words">
        <strong className="font-semibold text-vscode-text-muted">Data de atualização:</strong>{' '}
        {formatDashboardDate(dashboard.dataAtualizacao)}
      </p>
    </div>
  )
}

export default function DashboardTable({
  dashboards,
  onEdit,
  onDelete,
  onClearFilters,
  canEdit = true,
  canDelete = true,
}: DashboardTableProps) {
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([])

  const toggleRowDetails = useCallback((rowId: string) => {
    setExpandedRowIds((current) =>
      current.includes(rowId)
        ? current.filter((id) => id !== rowId)
        : [...current, rowId],
    )
  }, [])

  const columns = useMemo<ColumnDef<Dashboard>[]>(
    () => [
      {
        id: 'dashboard',
        header: 'Dashboard',
        accessorKey: 'nome',
        enableSorting: true,
        cell: ({ row }) => {
          const dashboard = row.original

          return (
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent">
                <DashboardMaterialIcon name={dashboard.icone} className="text-base" filled />
              </span>
              <span className="min-w-0 break-words font-medium leading-snug text-vscode-text">
                {dashboard.nome}
              </span>
            </div>
          )
        },
      },
      {
        id: 'visivel',
        header: 'Visibilidade',
        accessorKey: 'visivel',
        enableSorting: true,
        cell: ({ row }) => <DashboardStatusBadges dashboard={row.original} field="visivel" />,
      },
      {
        id: 'privacidade',
        header: 'Privacidade',
        accessorKey: 'privacidade',
        enableSorting: true,
        cell: ({ row }) => <DashboardStatusBadges dashboard={row.original} field="privacidade" />,
      },
      {
        id: 'temporario',
        header: 'Temporalidade',
        accessorKey: 'temporario',
        enableSorting: true,
        cell: ({ row }) => <DashboardStatusBadges dashboard={row.original} field="temporario" />,
      },
      {
        id: 'detalhes',
        header: 'Detalhes',
        enableSorting: false,
        enableResizing: false,
        meta: { stopRowClick: true },
        cell: ({ row }) => {
          const isExpanded = expandedRowIds.includes(row.id)

          return (
            <button
              type="button"
              onClick={() => toggleRowDetails(row.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-vscode-border px-2.5 py-1 text-xs text-vscode-text-muted transition-colors hover:border-vscode-accent/40 hover:bg-vscode-accent/10 hover:text-vscode-text focus:outline-none focus:ring-2 focus:ring-vscode-accent/40"
              aria-label={
                isExpanded ? 'Ocultar detalhes da linha' : 'Exibir detalhes da linha'
              }
            >
              {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              {isExpanded ? 'Ocultar' : 'Detalhes'}
            </button>
          )
        },
      },
      {
        id: 'acoes',
        header: 'Ações',
        enableSorting: false,
        enableResizing: false,
        meta: { lockPosition: 'end', stopRowClick: true },
        cell: ({ row }) => {
          const dashboard = row.original

          return (
            <div className="flex items-center gap-0.5">
              <IconButton
                icon={<PencilIcon />}
                label={`Editar ${dashboard.nome}`}
                title={
                  canEdit
                    ? 'Editar'
                    : 'Você não possui permissão para editar dashboards.'
                }
                onClick={() => onEdit(dashboard)}
                disabled={!canEdit}
                className="h-8 w-8 rounded-full border border-vscode-border text-sky-400 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-300 disabled:opacity-40"
              />
              <IconButton
                icon={<TrashIcon />}
                label={`Excluir ${dashboard.nome}`}
                title={
                  canDelete
                    ? 'Excluir'
                    : 'Você não possui permissão para excluir dashboards.'
                }
                onClick={() => onDelete(dashboard)}
                disabled={!canDelete}
                className="h-8 w-8 rounded-full border border-vscode-border text-red-400 hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 disabled:opacity-40"
              />
            </div>
          )
        },
      },
    ],
    [canDelete, canEdit, expandedRowIds, onDelete, onEdit, toggleRowDetails],
  )

  if (dashboards.length === 0) {
    return <DashboardEmptyState onClearFilters={onClearFilters} />
  }

  return (
    <DataGrid
      gridId={GRID_IDS.manageDashboards}
      data={dashboards}
      columns={columns}
      getRowId={(dashboard) => String(dashboard.id)}
      enableSorting
      sortingMode="client"
      renderSubRow={(dashboard) => <DashboardTableDetailsRow dashboard={dashboard} />}
      expandedRowIds={expandedRowIds}
    />
  )
}
