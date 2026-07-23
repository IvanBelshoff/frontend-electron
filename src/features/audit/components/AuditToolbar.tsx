import clsx from 'clsx'
import Input from '@/components/ui/Input'
import AuditActiveFilterChips from '@/features/audit/components/AuditActiveFilterChips'
import type { AuditAdvancedFilters, AuditFilters } from '@/features/audit/audit-types'
import { FilterIcon, SearchIcon } from '@/features/dashboards/icons/DashboardIcons'

type AuditToolbarProps = {
  appliedFilters: AuditFilters
  quickSearch: string
  activeAdvancedFilterCount: number
  onQuickSearchChange: (value: string) => void
  onOpenFilters: () => void
  onRemoveFilter: (key: keyof AuditAdvancedFilters) => void
}

export default function AuditToolbar({
  appliedFilters,
  quickSearch,
  activeAdvancedFilterCount,
  onQuickSearchChange,
  onOpenFilters,
  onRemoveFilter,
}: AuditToolbarProps) {
  const hasActiveFilters = activeAdvancedFilterCount > 0

  return (
    <div className="space-y-3 rounded-lg border border-vscode-border bg-vscode-sidebar/80 p-3">
      <div className="relative min-w-0">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vscode-text-muted" />

        <div className="flex">
          <Input
            value={quickSearch}
            onChange={(event) => onQuickSearchChange(event.target.value)}
            placeholder="E-mail, ação ou recurso..."
            className="rounded-r-none border-r-0 pl-9"
            aria-label="Buscar logs de auditoria"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur()
              }
            }}
          />

          <button
            type="button"
            onClick={onOpenFilters}
            aria-label={
              hasActiveFilters
                ? `Filtros (${activeAdvancedFilterCount} ativos)`
                : 'Abrir filtros'
            }
            title={
              hasActiveFilters
                ? `Filtros (${activeAdvancedFilterCount} ativos)`
                : 'Filtros'
            }
            className={clsx(
              'inline-flex h-9 shrink-0 items-center justify-center rounded-r border border-vscode-border px-3 transition-colors focus:outline-none focus:ring-2 focus:ring-vscode-accent/40',
              hasActiveFilters
                ? 'border-vscode-accent bg-vscode-accent/15 text-vscode-accent'
                : 'bg-vscode-input-bg text-vscode-text-muted hover:bg-vscode-activity-bar hover:text-vscode-text',
            )}
          >
            <FilterIcon />
          </button>
        </div>
      </div>

      <AuditActiveFilterChips filters={appliedFilters} onRemove={onRemoveFilter} />
    </div>
  )
}
