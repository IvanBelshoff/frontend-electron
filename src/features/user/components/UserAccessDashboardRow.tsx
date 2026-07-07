import clsx from 'clsx'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import type { AccessDashboard } from '@/features/user/user-dashboard-access-types'

type UserAccessDashboardRowProps = {
  dashboard: AccessDashboard
  selected: boolean
  disabled?: boolean
  isOwner?: boolean
  onToggle: () => void
}

export default function UserAccessDashboardRow({
  dashboard,
  selected,
  disabled = false,
  isOwner = false,
  onToggle,
}: UserAccessDashboardRowProps) {
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

      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent">
        <DashboardMaterialIcon name={dashboard.icone} className="text-[1.15rem]" filled />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-vscode-text">{dashboard.nome}</span>
        {isOwner && (
          <span className="mt-0.5 inline-flex rounded-full border border-vscode-accent/30 bg-vscode-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-vscode-accent">
            Proprietário
          </span>
        )}
      </span>
    </label>
  )
}
