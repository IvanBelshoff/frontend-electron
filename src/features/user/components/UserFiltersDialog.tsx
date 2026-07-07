import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import SettingsField from '@/components/settings/SettingsField'
import SettingsSelect from '@/components/settings/SettingsSelect'
import {
  areUserFiltersEqual,
  DEFAULT_USER_FILTERS,
  getUserPermissionFilterOptions,
  getUserRoleFilterOptions,
  type UserFilters,
} from '@/features/user/user-list-filters'
import { FilterOptionButton } from '@/features/dashboards/icons/DashboardIcons'

type UserFiltersDialogProps = {
  isOpen: boolean
  appliedFilters: UserFilters
  draftFilters: UserFilters
  onDraftChange: (filters: UserFilters) => void
  onApply: (filters: UserFilters) => void
  onClose: () => void
}

function isActiveFilter<TValue>(value: TValue, current: TValue) {
  return Object.is(value, current)
}

function formatRoleLabel(roleName: string): string {
  return roleName.replace(/^REGRA_/, '').replace(/_/g, ' ')
}

function formatPermissionLabel(permissionName: string): string {
  return permissionName.replace(/^PERMISSAO_/, '').replace(/_/g, ' ')
}

export default function UserFiltersDialog({
  isOpen,
  appliedFilters,
  draftFilters,
  onDraftChange,
  onApply,
  onClose,
}: UserFiltersDialogProps) {
  const roleOptions = getUserRoleFilterOptions()
  const permissionOptions = getUserPermissionFilterOptions()
  const canClearAppliedFilters = !areUserFiltersEqual(
    appliedFilters,
    DEFAULT_USER_FILTERS,
  )

  return (
    <Dialog isOpen={isOpen} title="Filtros" onClose={onClose} className="max-w-lg">
      <div className="space-y-5">
        <p className="text-sm text-vscode-text-muted">
          Refine a listagem selecionando os filtros abaixo.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <span className="block text-xs font-medium text-vscode-text">Status</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por status">
              <FilterOptionButton
                active={isActiveFilter(draftFilters.bloqueado, 'all')}
                onClick={() => onDraftChange({ ...draftFilters, bloqueado: 'all' })}
              >
                Todos
              </FilterOptionButton>
              <FilterOptionButton
                active={isActiveFilter(draftFilters.bloqueado, false)}
                onClick={() => onDraftChange({ ...draftFilters, bloqueado: false })}
              >
                Ativo
              </FilterOptionButton>
              <FilterOptionButton
                active={isActiveFilter(draftFilters.bloqueado, true)}
                onClick={() => onDraftChange({ ...draftFilters, bloqueado: true })}
              >
                Bloqueado
              </FilterOptionButton>
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-medium text-vscode-text">Regra</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por regra">
              <FilterOptionButton
                active={isActiveFilter(draftFilters.regra, 'all')}
                onClick={() => onDraftChange({ ...draftFilters, regra: 'all' })}
              >
                Todas
              </FilterOptionButton>
              {roleOptions.map((roleName) => (
                <FilterOptionButton
                  key={roleName}
                  active={isActiveFilter(draftFilters.regra, roleName)}
                  onClick={() => onDraftChange({ ...draftFilters, regra: roleName })}
                >
                  {formatRoleLabel(roleName)}
                </FilterOptionButton>
              ))}
            </div>
          </div>

          <SettingsField label="Permissão" htmlFor="userFilterPermissao">
            <SettingsSelect
              id="userFilterPermissao"
              value={draftFilters.permissao === 'all' ? '' : draftFilters.permissao}
              onChange={(event) => {
                const value = event.target.value
                onDraftChange({
                  ...draftFilters,
                  permissao: value || 'all',
                })
              }}
            >
              <option value="">Todas</option>
              {permissionOptions.map((permissionName) => (
                <option key={permissionName} value={permissionName}>
                  {formatPermissionLabel(permissionName)}
                </option>
              ))}
            </SettingsSelect>
          </SettingsField>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-vscode-border pt-4">
          {canClearAppliedFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onApply(DEFAULT_USER_FILTERS)}
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
