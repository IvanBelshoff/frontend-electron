import clsx from 'clsx'
import { Fragment, useCallback, useState } from 'react'
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

const TABLE_COLUMN_COUNT = 5

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
  const [expandedRowIds, setExpandedRowIds] = useState<number[]>([])

  const toggleRowDetails = useCallback((connectionId: number) => {
    setExpandedRowIds((current) =>
      current.includes(connectionId)
        ? current.filter((id) => id !== connectionId)
        : [...current, connectionId],
    )
  }, [])

  if (connections.length === 0) {
    return <ConnectionEmptyState onClearFilters={onClearFilters} />
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-vscode-border">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-vscode-border bg-vscode-activity-bar">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Nome
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Tipo
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Database
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Detalhes
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {connections.map((connection, index) => {
            const isExpanded = expandedRowIds.includes(connection.id)
            const rowClassName = index % 2 === 0 ? 'bg-vscode-sidebar' : 'bg-vscode-input-bg/30'

            return (
              <Fragment key={connection.id}>
                <tr className={clsx('border-b border-vscode-border', rowClassName)}>
                  <td className="px-4 py-3">
                    <span
                      className="truncate font-medium text-vscode-text"
                      title={connection.nome}
                    >
                      {connection.nome}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="info">{TIPO_LABELS[connection.tipo]}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-vscode-text-muted">
                    {connection.database}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleRowDetails(connection.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-vscode-border px-2.5 py-1 text-xs text-vscode-text-muted transition-colors hover:border-vscode-accent/40 hover:bg-vscode-accent/10 hover:text-vscode-text focus:outline-none focus:ring-2 focus:ring-vscode-accent/40"
                      aria-label={
                        isExpanded ? 'Ocultar detalhes da linha' : 'Exibir detalhes da linha'
                      }
                    >
                      {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      {isExpanded ? 'Ocultar' : 'Detalhes'}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
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
                  </td>
                </tr>

                {isExpanded && (
                  <tr className={clsx('border-b border-vscode-border', rowClassName)}>
                    <td colSpan={TABLE_COLUMN_COUNT} className="px-4 py-3">
                      <ConnectionTableDetailsRow connection={connection} />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
