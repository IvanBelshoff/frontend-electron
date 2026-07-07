import clsx from 'clsx'
import Input from '@/components/ui/Input'
import {
  hasActiveMyDashboardDialogFilters,
} from '@/features/my-dashboards/my-dashboard-filters'
import type { MyDashboardFilters, MyDashboardViewMode } from '@/features/my-dashboards/my-dashboard-types'
import {
  FilterIcon,
  SearchIcon,
  StarFilledIcon,
  StarIcon,
  ViewModeToggle,
} from '@/features/dashboards/icons/DashboardIcons'

type MyDashboardsToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  filters: MyDashboardFilters
  onOpenFilters: () => void
  onToggleFavoritesFilter: () => void
  viewMode: MyDashboardViewMode
  onViewModeChange: (mode: MyDashboardViewMode) => void
}

export default function MyDashboardsToolbar({
  search,
  onSearchChange,
  filters,
  onOpenFilters,
  onToggleFavoritesFilter,
  viewMode,
  onViewModeChange,
}: MyDashboardsToolbarProps) {
  const hasDialogFilters = hasActiveMyDashboardDialogFilters(filters)

  return (
    <div className="rounded-xl border border-vscode-border bg-gradient-to-br from-vscode-sidebar/90 to-vscode-sidebar/50 p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vscode-text-muted" />

            <div className="flex">
              <Input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Pesquisar dashboards por nome"
                className="rounded-r-none border-r-0 pl-9"
                aria-label="Pesquisar dashboards por nome"
              />

              <button
                type="button"
                onClick={onOpenFilters}
                className={clsx(
                  'inline-flex h-9 shrink-0 items-center justify-center rounded-r border border-vscode-border px-3 transition-colors focus:outline-none focus:ring-2 focus:ring-vscode-accent/40',
                  hasDialogFilters
                    ? 'border-vscode-accent bg-vscode-accent/15 text-vscode-accent'
                    : 'bg-vscode-input-bg text-vscode-text-muted hover:bg-vscode-activity-bar hover:text-vscode-text',
                )}
                aria-label="Abrir filtros"
                title="Filtros"
              >
                <FilterIcon />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleFavoritesFilter}
            className={clsx(
              'inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-all',
              filters.favoritos
                ? 'border-amber-400/50 bg-amber-400/15 text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.15)]'
                : 'border-vscode-border bg-vscode-input-bg text-vscode-text-muted hover:border-amber-400/40 hover:text-amber-200',
            )}
          >
            {filters.favoritos ? (
              <StarFilledIcon className="h-4 w-4 text-amber-400" />
            ) : (
              <StarIcon className="h-4 w-4" />
            )}
            Favoritos
          </button>
        </div>

        <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
      </div>
    </div>
  )
}
