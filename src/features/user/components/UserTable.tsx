import clsx from 'clsx'
import { Fragment, useCallback, useState } from 'react'
import IconButton from '@/components/ui/IconButton'
import UserEmptyState from '@/features/user/components/UserEmptyState'
import UserExpandedDetails from '@/features/user/components/UserExpandedDetails'
import UserStatusBadge from '@/features/user/components/UserStatusBadge'
import { formatUserDate } from '@/features/user/format-user-date'
import type { ManagedUser } from '@/features/user/user-list-types'
import { getUserDisplayName } from '@/features/user/user-list-types'
import UserAvatar from '@/features/user/UserAvatar'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
} from '@/features/dashboards/icons/DashboardIcons'

type UserTableProps = {
  users: ManagedUser[]
  onEdit: (user: ManagedUser) => void
  onDelete: (user: ManagedUser) => void
  onClearFilters: () => void
}

const TABLE_COLUMN_COUNT = 7
const VISIBLE_PERMISSIONS = 2

function formatRegrasList(regras: string[]): string {
  if (regras.length === 0) {
    return 'Nenhuma'
  }

  return regras.join(', ')
}

function formatPermissoesList(permissoes: string[]): string {
  if (permissoes.length === 0) {
    return 'Nenhuma'
  }

  if (permissoes.length <= VISIBLE_PERMISSIONS) {
    return permissoes.join(', ')
  }

  const visible = permissoes.slice(0, VISIBLE_PERMISSIONS).join(', ')
  const remaining = permissoes.length - VISIBLE_PERMISSIONS

  return `${visible}, +${remaining}`
}

export default function UserTable({
  users,
  onEdit,
  onDelete,
  onClearFilters,
}: UserTableProps) {
  const [expandedRowIds, setExpandedRowIds] = useState<number[]>([])

  const toggleRowDetails = useCallback((userId: number) => {
    setExpandedRowIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    )
  }, [])

  if (users.length === 0) {
    return <UserEmptyState onClearFilters={onClearFilters} />
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-vscode-border">
      <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-vscode-border bg-vscode-activity-bar">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Usuário
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Status
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Último login
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Regras
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Permissões
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
          {users.map((user, index) => {
            const displayName = getUserDisplayName(user)
            const isExpanded = expandedRowIds.includes(user.id)
            const rowClassName = index % 2 === 0 ? 'bg-vscode-sidebar' : 'bg-vscode-input-bg/30'

            return (
              <Fragment key={user.id}>
                <tr className={clsx('border-b border-vscode-border', rowClassName)}>
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <UserAvatar
                        userId={user.id}
                        nome={user.nome}
                        sobrenome={user.sobrenome}
                        foto={user.foto}
                        className="h-8 w-8 text-xs"
                      />

                      <div className="min-w-0">
                        <p className="truncate font-medium text-vscode-text" title={displayName}>
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-vscode-text-muted" title={user.email}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <UserStatusBadge bloqueado={user.bloqueado} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-vscode-text">
                    {formatUserDate(user.ultimoLogin)}
                  </td>
                  <td className="px-4 py-3 text-xs text-vscode-text-muted">
                    <span className="break-words">{formatRegrasList(user.regras)}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-vscode-text-muted">
                    <span className="break-words">{formatPermissoesList(user.permissoes)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleRowDetails(user.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-vscode-border px-2.5 py-1 text-xs text-vscode-text-muted transition-colors hover:border-vscode-accent/40 hover:bg-vscode-accent/10 hover:text-vscode-text focus:outline-none focus:ring-2 focus:ring-vscode-accent/40"
                      aria-label={
                        isExpanded
                          ? `Ocultar detalhes de ${displayName}`
                          : `Exibir detalhes de ${displayName}`
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
                    </div>
                  </td>
                </tr>

                {isExpanded && (
                  <tr className={clsx('border-b border-vscode-border', rowClassName)}>
                    <td colSpan={TABLE_COLUMN_COUNT} className="px-4 py-3">
                      <UserExpandedDetails user={user} />
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
