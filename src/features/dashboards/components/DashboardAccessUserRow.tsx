import clsx from 'clsx'
import { getAccessUserFullName } from '@/features/dashboards/dashboard-access-utils'
import type { AccessUser } from '@/features/user/user-types'
import UserAvatar from '@/features/user/UserAvatar'

type DashboardAccessUserRowProps = {
  user: AccessUser
  selected: boolean
  disabled?: boolean
  isOwner?: boolean
  showAiKnowledge?: boolean
  onToggleAiKnowledge?: () => void
  onToggle: () => void
}

export default function DashboardAccessUserRow({
  user,
  selected,
  disabled = false,
  isOwner = false,
  showAiKnowledge = false,
  onToggleAiKnowledge,
  onToggle,
}: DashboardAccessUserRowProps) {
  const fullName = getAccessUserFullName(user)

  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-md border px-3 py-2 transition-colors',
        selected
          ? 'border-vscode-accent bg-vscode-accent/10'
          : 'border-vscode-border bg-vscode-bg/40 hover:border-vscode-accent/40',
        disabled && 'opacity-70',
      )}
    >
      <label className={clsx('flex min-w-0 flex-1 cursor-pointer items-center gap-3', disabled && 'cursor-not-allowed')}>
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

      {showAiKnowledge && onToggleAiKnowledge && (
        <button
          type="button"
          title="Permitir conhecimento da IA"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation()
            onToggleAiKnowledge()
          }}
          className={clsx(
            'shrink-0 rounded border px-2 py-1 text-[10px] font-medium uppercase tracking-wide transition-colors',
            user.permitirConhecimentoIa
              ? 'border-vscode-accent/50 bg-vscode-accent/15 text-vscode-accent'
              : 'border-vscode-border text-vscode-text-muted hover:border-vscode-accent/40 hover:text-vscode-text',
            disabled && 'cursor-not-allowed',
          )}
        >
          IA
        </button>
      )}
    </div>
  )
}
