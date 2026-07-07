import clsx from 'clsx'
import Input from '@/components/ui/Input'
import UserAccessDashboardRow from '@/features/user/components/UserAccessDashboardRow'
import type { AccessDashboard } from '@/features/user/user-dashboard-access-types'
import { SearchIcon } from '@/features/dashboards/icons/DashboardIcons'

type UserAccessDashboardColumnProps = {
  title: string
  count: number
  helper: string
  dashboards: AccessDashboard[]
  selectedIds: number[]
  search: string
  onSearchChange: (value: string) => void
  onToggleDashboard: (dashboardId: number) => void
  onToggleSelectAll: () => void
  isAllSelected: boolean
  disabled?: boolean
  userId?: number
}

export default function UserAccessDashboardColumn({
  title,
  count,
  helper,
  dashboards,
  selectedIds,
  search,
  onSearchChange,
  onToggleDashboard,
  onToggleSelectAll,
  isAllSelected,
  disabled = false,
  userId,
}: UserAccessDashboardColumnProps) {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-lg border border-vscode-border bg-vscode-sidebar/60 p-4">
      <div className="mb-3 flex shrink-0 items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <strong className="text-sm text-vscode-text">{title}</strong>
            <span className="rounded-full border border-vscode-border px-2 py-0.5 text-xs text-vscode-text-muted">
              {count}
            </span>
          </div>
          <p className="mt-1 text-xs text-vscode-text-muted">{helper}</p>
        </div>

        <button
          type="button"
          onClick={onToggleSelectAll}
          disabled={disabled || dashboards.length === 0}
          className={clsx(
            'shrink-0 rounded border px-2.5 py-1 text-xs font-medium transition-colors',
            'border-vscode-border text-vscode-text-muted hover:border-vscode-accent/40 hover:text-vscode-text',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {isAllSelected ? 'Limpar seleção' : 'Selecionar todos'}
        </button>
      </div>

      <div className="relative mb-3 shrink-0">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-vscode-text-muted">
          <SearchIcon />
        </span>
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Pesquisar por nome do dashboard"
          disabled={disabled}
          className="pl-9"
        />
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {dashboards.length === 0 ? (
          <p className="py-8 text-center text-sm text-vscode-text-muted">
            Nenhum dashboard encontrado.
          </p>
        ) : (
          dashboards.map((dashboard) => {
            const isOwner = userId !== undefined && dashboard.idProprietario === userId

            return (
              <UserAccessDashboardRow
                key={dashboard.id}
                dashboard={dashboard}
                selected={selectedIds.includes(dashboard.id)}
                disabled={disabled || isOwner}
                isOwner={isOwner}
                onToggle={() => onToggleDashboard(dashboard.id)}
              />
            )
          })
        )}
      </div>
    </section>
  )
}
