import clsx from 'clsx'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { hasActiveUserFilters } from '@/features/user/user-list-filters'
import type { UserFilters } from '@/features/user/user-list-filters'
import type { UserViewMode } from '@/features/user/user-list-types'
import {
  FilterIcon,
  PlusIcon,
  SearchIcon,
  ViewModeToggle,
} from '@/features/dashboards/icons/DashboardIcons'

type UserToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  filters: UserFilters
  onOpenFilters: () => void
  viewMode: UserViewMode
  onViewModeChange: (mode: UserViewMode) => void
  onCreate: () => void
}

export default function UserToolbar({
  search,
  onSearchChange,
  filters,
  onOpenFilters,
  viewMode,
  onViewModeChange,
  onCreate,
}: UserToolbarProps) {
  const hasActiveFilters = hasActiveUserFilters(filters)

  return (
    <div className="rounded-lg border border-vscode-border bg-vscode-sidebar/80 p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vscode-text-muted" />

          <div className="flex">
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Pesquisar usuários por nome, e-mail, regra ou permissão"
              className="rounded-r-none border-r-0 pl-9"
              aria-label="Pesquisar usuários por nome, e-mail, regra ou permissão"
            />

            <button
              type="button"
              onClick={onOpenFilters}
              className={clsx(
                'inline-flex h-9 shrink-0 items-center justify-center rounded-r border border-vscode-border px-3 transition-colors focus:outline-none focus:ring-2 focus:ring-vscode-accent/40',
                hasActiveFilters
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

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <ViewModeToggle value={viewMode} onChange={onViewModeChange} />

          <Button variant="primary" size="md" onClick={onCreate}>
            <PlusIcon />
            Criar
          </Button>
        </div>
      </div>
    </div>
  )
}
