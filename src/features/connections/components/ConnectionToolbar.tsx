import clsx from 'clsx'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { hasActiveConnectionFilters } from '@/features/connections/connection-filters'
import type { ConnectionFilters } from '@/features/connections/connection-filters'
import type { ConnectionViewMode } from '@/features/connections/connection-list-types'
import {
  FilterIcon,
  PlusIcon,
  SearchIcon,
  ViewModeToggle,
} from '@/features/dashboards/icons/DashboardIcons'

type ConnectionToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  filters: ConnectionFilters
  onOpenFilters: () => void
  viewMode: ConnectionViewMode
  onViewModeChange: (mode: ConnectionViewMode) => void
  onCreate: () => void
  canCreate?: boolean
}

export default function ConnectionToolbar({
  search,
  onSearchChange,
  filters,
  onOpenFilters,
  viewMode,
  onViewModeChange,
  onCreate,
  canCreate = true,
}: ConnectionToolbarProps) {
  const hasActiveFilters = hasActiveConnectionFilters(filters)

  return (
    <div className="rounded-lg border border-vscode-border bg-vscode-sidebar/80 p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vscode-text-muted" />

          <div className="flex">
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Pesquisar conexões por nome"
              className="rounded-r-none border-r-0 pl-9"
              aria-label="Pesquisar conexões por nome"
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

          <Button
            variant="primary"
            size="md"
            onClick={onCreate}
            disabled={!canCreate}
            title={
              canCreate ? 'Criar conexão' : 'Você não possui permissão para criar conexões.'
            }
          >
            <PlusIcon />
            Criar
          </Button>
        </div>
      </div>
    </div>
  )
}
