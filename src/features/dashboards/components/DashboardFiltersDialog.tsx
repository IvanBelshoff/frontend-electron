import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import {
  areDashboardFiltersEqual,
  DEFAULT_DASHBOARD_FILTERS,
} from '@/features/dashboards/dashboard-filters'
import type { DashboardFilters } from '@/features/dashboards/dashboard-types'
import { FilterOptionButton } from '@/features/dashboards/icons/DashboardIcons'

type DashboardFiltersDialogProps = {
  isOpen: boolean
  appliedFilters: DashboardFilters
  draftFilters: DashboardFilters
  onDraftChange: (filters: DashboardFilters) => void
  onApply: (filters: DashboardFilters) => void
  onClose: () => void
}

function isActiveFilter<TValue>(value: TValue, current: TValue) {
  return Object.is(value, current)
}

export default function DashboardFiltersDialog({
  isOpen,
  appliedFilters,
  draftFilters,
  onDraftChange,
  onApply,
  onClose,
}: DashboardFiltersDialogProps) {
  const canClearAppliedFilters = !areDashboardFiltersEqual(
    appliedFilters,
    DEFAULT_DASHBOARD_FILTERS,
  )

  return (
    <Dialog isOpen={isOpen} title="Filtros" onClose={onClose} className="max-w-lg">
      <div className="space-y-5">
        <p className="text-sm text-vscode-text-muted">
          Refine a listagem selecionando os filtros abaixo.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <span className="block text-xs font-medium text-vscode-text">Privacidade</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por privacidade">
              <FilterOptionButton
                active={isActiveFilter(draftFilters.privacidade, 'all')}
                onClick={() => onDraftChange({ ...draftFilters, privacidade: 'all' })}
              >
                Todos
              </FilterOptionButton>
              <FilterOptionButton
                active={isActiveFilter(draftFilters.privacidade, 'privado')}
                onClick={() => onDraftChange({ ...draftFilters, privacidade: 'privado' })}
              >
                Privado
              </FilterOptionButton>
              <FilterOptionButton
                active={isActiveFilter(draftFilters.privacidade, 'publico')}
                onClick={() => onDraftChange({ ...draftFilters, privacidade: 'publico' })}
              >
                Público
              </FilterOptionButton>
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-medium text-vscode-text">Visibilidade</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por visibilidade">
              <FilterOptionButton
                active={isActiveFilter(draftFilters.visivel, 'all')}
                onClick={() => onDraftChange({ ...draftFilters, visivel: 'all' })}
              >
                Todos
              </FilterOptionButton>
              <FilterOptionButton
                active={isActiveFilter(draftFilters.visivel, true)}
                onClick={() => onDraftChange({ ...draftFilters, visivel: true })}
              >
                Visível
              </FilterOptionButton>
              <FilterOptionButton
                active={isActiveFilter(draftFilters.visivel, false)}
                onClick={() => onDraftChange({ ...draftFilters, visivel: false })}
              >
                Oculto
              </FilterOptionButton>
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-medium text-vscode-text">Temporário</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por temporalidade">
              <FilterOptionButton
                active={isActiveFilter(draftFilters.temporario, 'all')}
                onClick={() => onDraftChange({ ...draftFilters, temporario: 'all' })}
              >
                Todos
              </FilterOptionButton>
              <FilterOptionButton
                active={isActiveFilter(draftFilters.temporario, false)}
                onClick={() => onDraftChange({ ...draftFilters, temporario: false })}
              >
                Contínuo
              </FilterOptionButton>
              <FilterOptionButton
                active={isActiveFilter(draftFilters.temporario, true)}
                onClick={() => onDraftChange({ ...draftFilters, temporario: true })}
              >
                Temporário
              </FilterOptionButton>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-vscode-border pt-4">
          {canClearAppliedFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onApply(DEFAULT_DASHBOARD_FILTERS)}
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
