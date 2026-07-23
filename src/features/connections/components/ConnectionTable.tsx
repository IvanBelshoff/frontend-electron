import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import DataGrid from '@/components/data-grid/DataGrid'
import { GRID_IDS } from '@/components/data-grid/grid-registry'
import IconButton from '@/components/ui/IconButton'
import Badge from '@/components/ui/Badge'
import ConnectionEmptyState from '@/features/connections/components/ConnectionEmptyState'
import type { Connection, TipoConexao } from '@/features/connections/connection-types'
import { formatDashboardDate } from '@/features/dashboards/format-dashboard-date'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
} from '@/features/dashboards/icons/DashboardIcons'

type ConnectionTableProps = {
  connections: Connection[]
  onEdit: (connection: Connection) => void
  onDelete: (connection: Connection) => void
  onClearFilters: () => void
  canEdit?: boolean
  canDelete?: boolean
}

const TIPO_LABELS: Record<TipoConexao, string> = {
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  mssql: 'SQL Server',
  oracle: 'Oracle',
}

function ConnectionTableDetailsRow({ connection }: { connection: Connection }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-2 text-xs text-vscode-text-muted sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2">
      <p className="min-w-0 break-words">
        <strong className="font-semibold text-vscode-text-muted">Criado por:</strong>{' '}
        {connection.usuarioCadastrador || 'Não informado'}
      </p>
      <p className="min-w-0 break-words">
        <strong className="font-semibold text-vscode-text-muted">Data de criação:</strong>{' '}
        {formatDashboardDate(connection.dataCriacao)}
      </p>
      <p className="min-w-0 break-words">
        <strong className="font-semibold text-vscode-text-muted">Atualizado por:</strong>{' '}
        {connection.usuarioAtualizador || 'Não informado'}
      </p>
      <p className="min-w-0 break-words">
        <strong className="font-semibold text-vscode-text-muted">Data de atualização:</strong>{' '}
        {formatDashboardDate(connection.dataAtualizacao)}
      </p>
    </div>
  )
}

export default function ConnectionTable({
  connections,
  onEdit,
  onDelete,
  onClearFilters,
  canEdit = true,
  canDelete = true,
}: ConnectionTableProps) {
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([])

  const toggleRowDetails = useCallback((rowId: string) => {
    setExpandedRowIds((current) =>
      current.includes(rowId)
        ? current.filter((id) => id !== rowId)
        : [...current, rowId],
    )
  }, [])

  const columns = useMemo<ColumnDef<Connection>[]>(
    () => [
      {
        id: 'nome',
        header: 'Nome',
        accessorKey: 'nome',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="min-w-0 break-words font-medium leading-snug text-vscode-text">
            {row.original.nome}
          </span>
        ),
      },
      {
        id: 'tipo',
        header: 'Tipo',
        accessorKey: 'tipo',
        enableSorting: true,
        cell: ({ row }) => <Badge variant="info">{TIPO_LABELS[row.original.tipo]}</Badge>,
      },
      {
        id: 'database',
        header: 'Database',
        accessorKey: 'database',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-vscode-text-muted">{row.original.database}</span>
        ),
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
          const connection = row.original

          return (
            <div className="flex items-center gap-0.5">
              <IconButton
                icon={<PencilIcon />}
                label={`Editar ${connection.nome}`}
                title={
                  canEdit
                    ? 'Editar'
                    : 'Você não possui permissão para editar conexões.'
                }
                onClick={() => onEdit(connection)}
                disabled={!canEdit}
                className="h-8 w-8 rounded-full border border-vscode-border text-sky-400 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-300 disabled:opacity-40"
              />
              <IconButton
                icon={<TrashIcon />}
                label={`Excluir ${connection.nome}`}
                title={
                  canDelete
                    ? 'Excluir'
                    : 'Você não possui permissão para excluir conexões.'
                }
                onClick={() => onDelete(connection)}
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

  if (connections.length === 0) {
    return <ConnectionEmptyState onClearFilters={onClearFilters} />
  }

  return (
    <DataGrid
      gridId={GRID_IDS.manageConnections}
      data={connections}
      columns={columns}
      getRowId={(connection) => String(connection.id)}
      enableSorting
      sortingMode="client"
      renderSubRow={(connection) => <ConnectionTableDetailsRow connection={connection} />}
      expandedRowIds={expandedRowIds}
    />
  )
}
