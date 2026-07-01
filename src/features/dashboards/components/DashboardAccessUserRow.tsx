import clsx from 'clsx'
import { getAccessUserFullName } from '@/features/dashboards/dashboard-access-utils'
import type { AccessUser } from '@/features/user/user-types'
import UserAvatar from '@/features/user/UserAvatar'

type DashboardAccessUserRowProps = {
  user: AccessUser
  selected: boolean
  disabled?: boolean
  isOwner?: boolean
  onToggle: () => void
}

export default function DashboardAccessUserRow({
  user,
  selected,
  disabled = false,
  isOwner = false,
  onToggle,
}: DashboardAccessUserRowProps) {
  const fullName = getAccessUserFullName(user)

  return (
    <label
      className={clsx(
        'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-colors',
        selected
          ? 'border-vscode-accent bg-vscode-accent/10'
          : 'border-vscode-border bg-vscode-bg/40 hover:border-vscode-accent/40',
        disabled && 'cursor-not-allowed opacity-70',
      )}
    >
      <input
        type="checkbox"
        checked={selected}
        disabled={disabled}
        onChange={onToggle}
        className="h-4 w-4 rounded border-vscode-border accent-vscode-accent"
      />

      <UserAvatar
        userId={user.id}
        nome={user.nome}
        sobrenome={user.sobrenome}
        foto={user.foto}
      />

      <span className="min-w-0 flex-1 truncate text-sm text-vscode-text">{fullName}</span>

      {isOwner && (
        <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300">
          Criador
        </span>
      )}
    </label>
  )
}
