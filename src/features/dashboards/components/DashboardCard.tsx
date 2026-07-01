import { useState } from 'react'
import IconButton from '@/components/ui/IconButton'
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

type DashboardCardProps = {
  dashboard: Dashboard
  onEdit: (dashboard: Dashboard) => void
  onDelete: (dashboard: Dashboard) => void
}

export default function DashboardCard({ dashboard, onEdit, onDelete }: DashboardCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="flex w-full min-w-0 flex-col gap-3 rounded-lg border border-vscode-border bg-vscode-sidebar p-4 transition-colors hover:border-vscode-accent/40">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent">
            <DashboardMaterialIcon name={dashboard.icone} className="text-[1.125rem]" filled />
          </span>

          <h3 className="truncate text-sm font-semibold leading-none text-vscode-text" title={dashboard.nome}>
            {dashboard.nome}
          </h3>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton
            icon={<PencilIcon />}
            label={`Editar ${dashboard.nome}`}
            title="Editar"
            onClick={() => onEdit(dashboard)}
            className="h-8 w-8 rounded-full border border-vscode-border text-sky-400 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-300"
          />
          <IconButton
            icon={<TrashIcon />}
            label={`Excluir ${dashboard.nome}`}
            title="Excluir"
            onClick={() => onDelete(dashboard)}
            className="h-8 w-8 rounded-full border border-vscode-border text-red-400 hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
          />
          <IconButton
            icon={expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            label={expanded ? 'Ocultar detalhes do dashboard' : 'Exibir detalhes do dashboard'}
            title={expanded ? 'Recolher' : 'Expandir'}
            onClick={() => setExpanded((current) => !current)}
            className="h-8 w-8 rounded-full border border-vscode-border hover:bg-vscode-activity-bar"
          />
        </div>
      </div>

      <DashboardStatusBadges dashboard={dashboard} />

      {expanded && (
        <div className="min-w-0 border-t border-vscode-border pt-3">
          <div className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-2 text-xs text-vscode-text-muted">
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
        </div>
      )}
    </article>
  )
}
