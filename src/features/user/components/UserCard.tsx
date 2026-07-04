import { useState } from 'react'
import IconButton from '@/components/ui/IconButton'
import UserCountBadges from '@/features/user/components/UserCountBadges'
import UserExpandedDetails from '@/features/user/components/UserExpandedDetails'
import UserStatusBadge from '@/features/user/components/UserStatusBadge'
import type { ManagedUser } from '@/features/user/user-list-types'
import { getUserDisplayName } from '@/features/user/user-list-types'
import UserAvatar from '@/features/user/UserAvatar'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
} from '@/features/dashboards/icons/DashboardIcons'

type UserCardProps = {
  user: ManagedUser
  onEdit: (user: ManagedUser) => void
  onDelete: (user: ManagedUser) => void
}

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const [expanded, setExpanded] = useState(false)
  const displayName = getUserDisplayName(user)

  return (
    <article className="flex w-full min-w-0 flex-col gap-3 rounded-lg border border-vscode-border bg-vscode-sidebar p-4 transition-colors hover:border-vscode-accent/40">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <UserAvatar
            userId={user.id}
            nome={user.nome}
            sobrenome={user.sobrenome}
            foto={user.foto}
            className="h-9 w-9 text-sm"
          />

          <div className="min-w-0">
            <h3
              className="truncate text-sm font-semibold leading-tight text-vscode-text"
              title={displayName}
            >
              {displayName}
            </h3>
            <p className="truncate text-xs text-vscode-text-muted" title={user.email}>
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton
            icon={<PencilIcon />}
            label={`Editar ${displayName}`}
            title="Editar"
            onClick={() => onEdit(user)}
            className="h-8 w-8 rounded-full border border-vscode-border text-sky-400 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-300"
          />
          <IconButton
            icon={<TrashIcon />}
            label={`Excluir ${displayName}`}
            title="Excluir"
            onClick={() => onDelete(user)}
            className="h-8 w-8 rounded-full border border-vscode-border text-red-400 hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
          />
          <IconButton
            icon={expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            label={
              expanded
                ? `Ocultar detalhes de ${displayName}`
                : `Exibir detalhes de ${displayName}`
            }
            title={expanded ? 'Recolher' : 'Expandir'}
            onClick={() => setExpanded((current) => !current)}
            className="h-8 w-8 rounded-full border border-vscode-border hover:bg-vscode-activity-bar"
          />
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-wrap items-center gap-2">
        <UserStatusBadge bloqueado={user.bloqueado} />
        <UserCountBadges user={user} />
      </div>

      {expanded && <UserExpandedDetails user={user} />}
    </article>
  )
}
