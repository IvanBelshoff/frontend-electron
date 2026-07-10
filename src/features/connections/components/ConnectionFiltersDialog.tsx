import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import {
  areConnectionFiltersEqual,
  DEFAULT_CONNECTION_FILTERS,
} from '@/features/connections/connection-filters'
import type { ConnectionFilters } from '@/features/connections/connection-filters'
import type { TipoConexao } from '@/features/connections/connection-types'
import { FilterOptionButton } from '@/features/dashboards/icons/DashboardIcons'

type ConnectionFiltersDialogProps = {
  isOpen: boolean
  appliedFilters: ConnectionFilters
  draftFilters: ConnectionFilters
  onDraftChange: (filters: ConnectionFilters) => void
  onApply: (filters: ConnectionFilters) => void
  onClose: () => void
}

const TIPO_OPTIONS: Array<{ value: TipoConexao | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'postgres', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'mssql', label: 'SQL Server' },
  { value: 'oracle', label: 'Oracle' },
]

function isActiveFilter<TValue>(value: TValue, current: TValue) {
  return Object.is(value, current)
}

export default function ConnectionFiltersDialog({
  isOpen,
  appliedFilters,
  draftFilters,
  onDraftChange,
  onApply,
  onClose,
}: ConnectionFiltersDialogProps) {
  const canClearAppliedFilters = !areConnectionFiltersEqual(
    appliedFilters,
    DEFAULT_CONNECTION_FILTERS,
  )

  return (
    <Dialog isOpen={isOpen} title="Filtros" onClose={onClose} className="max-w-lg">
      <div className="space-y-5">
        <p className="text-sm text-vscode-text-muted">
          Refine a listagem selecionando os filtros abaixo.
        </p>

        <div className="space-y-2">
          <span className="block text-xs font-medium text-vscode-text">Tipo de conexão</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo de conexão">
            {TIPO_OPTIONS.map((option) => (
              <FilterOptionButton
                key={option.value}
                active={isActiveFilter(draftFilters.tipo, option.value)}
                onClick={() => onDraftChange({ ...draftFilters, tipo: option.value })}
              >
                {option.label}
              </FilterOptionButton>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-vscode-border pt-4">
          {canClearAppliedFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onApply(DEFAULT_CONNECTION_FILTERS)}
            >
              Limpar filtros
            </Button>
          )}

          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>

          <Button variant="primary" size="sm" onClick={() => onApply(draftFilters)}>
            Aplicar
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
