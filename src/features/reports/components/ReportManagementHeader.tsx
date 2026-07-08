import clsx from 'clsx'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { RefreshIcon } from '@/components/settings/SettingsIcons'
import IconButton from '@/components/ui/IconButton'
import { hasActiveReportFilters } from '@/features/reports/report-filters'
import type { ReportFilters, ReportViewMode } from '@/features/reports/report-types'
import {
  FilterIcon,
  PlusIcon,
  SearchIcon,
  ViewModeToggle,
} from '@/features/dashboards/icons/DashboardIcons'

type ReportManagementHeaderProps = {
  filteredCount: number
  totalCount: number
  isRefreshing: boolean
  onRefresh: () => void
  search: string
  onSearchChange: (value: string) => void
  filters: ReportFilters
  onOpenFilters: () => void
  viewMode: ReportViewMode
  onViewModeChange: (mode: ReportViewMode) => void
  onCreate: () => void
}

export default function ReportManagementHeader({
  filteredCount,
  totalCount,
  isRefreshing,
  onRefresh,
  search,
  onSearchChange,
  filters,
  onOpenFilters,
  viewMode,
  onViewModeChange,
  onCreate,
}: ReportManagementHeaderProps) {
  const hasActiveFilters = hasActiveReportFilters(filters)

  return (
    <header className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-vscode-text">Gerenciamento de Relatórios</h1>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-vscode-border px-3 py-1 text-xs text-vscode-text-muted">
            Exibindo {filteredCount} de {totalCount} relatórios
          </span>

          <IconButton
            icon={
              isRefreshing ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                  aria-hidden="true"
                />
              ) : (
                <RefreshIcon />
              )
            }
            label="Atualizar listagem"
            title="Atualizar listagem"
            onClick={onRefresh}
            disabled={isRefreshing}
          />
        </div>
      </div>

      <div className="rounded-lg border border-vscode-border bg-vscode-sidebar/80 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vscode-text-muted" />

            <div className="flex">
              <Input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Pesquisar relatórios por nome"
                className="rounded-r-none border-r-0 pl-9"
                aria-label="Pesquisar relatórios por nome"
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
    </header>
  )
}
