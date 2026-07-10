import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import IconButton from '@/components/ui/IconButton'
import type { Connection, TipoConexao } from '@/features/connections/connection-types'
import { formatDashboardDate } from '@/features/dashboards/format-dashboard-date'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DashboardMaterialIcon,
  PencilIcon,
  TrashIcon,
} from '@/features/dashboards/icons/DashboardIcons'

type ConnectionCardProps = {
  connection: Connection
  onEdit: (connection: Connection) => void
  onDelete: (connection: Connection) => void
  canEdit?: boolean
  canDelete?: boolean
}

const TIPO_LABELS: Record<TipoConexao, string> = {
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  mssql: 'SQL Server',
  oracle: 'Oracle',
}

export default function ConnectionCard({
  connection,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: ConnectionCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="flex w-full min-w-0 flex-col gap-3 rounded-lg border border-vscode-border bg-vscode-sidebar p-4 transition-colors hover:border-vscode-accent/40">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent">
            <DashboardMaterialIcon name="database" className="text-[1.125rem]" />
          </span>

          <h3
            className="truncate text-sm font-semibold leading-none text-vscode-text"
            title={connection.nome}
          >
            {connection.nome}
          </h3>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton
            icon={<PencilIcon />}
            label={`Editar ${connection.nome}`}
            title={
              canEdit ? 'Editar' : 'Você não possui permissão para editar conexões.'
            }
            onClick={() => onEdit(connection)}
            disabled={!canEdit}
            className="h-8 w-8 rounded-full border border-vscode-border text-sky-400 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-300 disabled:opacity-40"
          />
          <IconButton
            icon={<TrashIcon />}
            label={`Excluir ${connection.nome}`}
            title={
              canDelete ? 'Excluir' : 'Você não possui permissão para excluir conexões.'
            }
            onClick={() => onDelete(connection)}
            disabled={!canDelete}
            className="h-8 w-8 rounded-full border border-vscode-border text-red-400 hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 disabled:opacity-40"
          />
          <IconButton
            icon={expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            label={expanded ? 'Ocultar detalhes da conexão' : 'Exibir detalhes da conexão'}
            title={expanded ? 'Recolher' : 'Expandir'}
            onClick={() => setExpanded((current) => !current)}
            className="h-8 w-8 rounded-full border border-vscode-border hover:bg-vscode-activity-bar"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">{TIPO_LABELS[connection.tipo]}</Badge>
        <span className="truncate font-mono text-xs text-vscode-text-muted">
          {connection.database}
        </span>
      </div>

      {expanded && (
        <div className="min-w-0 border-t border-vscode-border pt-3">
          <div className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-2 text-xs text-vscode-text-muted">
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
        </div>
      )}
    </article>
  )
}
