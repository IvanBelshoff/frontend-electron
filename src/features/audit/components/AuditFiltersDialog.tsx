import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import SettingsField from '@/components/settings/SettingsField'
import SettingsSelect from '@/components/settings/SettingsSelect'
import type { AuditAdvancedFilters, AuditOutcome } from '@/features/audit/audit-types'
import { getAuditCategoryLabel } from '@/features/audit/audit-labels'
import { FilterOptionButton } from '@/features/dashboards/icons/DashboardIcons'
import { dayEndIso, dayStartIso, toDateInputValue } from '@/lib/datetime'

const CATEGORY_OPTIONS = [
  'auth',
  'user',
  'acl',
  'dashboard',
  'report',
  'connection',
  'scheduler',
] as const

const OUTCOME_OPTIONS: Array<{ value?: AuditOutcome; label: string }> = [
  { label: 'Todos' },
  { value: 'success', label: 'Sucesso' },
  { value: 'failure', label: 'Falha' },
  { value: 'denied', label: 'Negado' },
]

const DEFAULT_ADVANCED_FILTERS: AuditAdvancedFilters = {}

type AuditFiltersDialogProps = {
  isOpen: boolean
  draftFilters: AuditAdvancedFilters
  actions: string[]
  activeAdvancedFilterCount: number
  onDraftChange: (filters: AuditAdvancedFilters) => void
  onApply: (filters: AuditAdvancedFilters) => void
  onClose: () => void
}

export default function AuditFiltersDialog({
  isOpen,
  draftFilters,
  actions,
  activeAdvancedFilterCount,
  onDraftChange,
  onApply,
  onClose,
}: AuditFiltersDialogProps) {
  const canClearAppliedFilters = activeAdvancedFilterCount > 0

  return (
    <Dialog isOpen={isOpen} title="Filtros" onClose={onClose} className="max-w-2xl">
      <div className="space-y-5">
        <p className="text-sm text-vscode-text-muted">
          Refine a listagem de auditoria selecionando os filtros abaixo.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="ID usuário">
            <Input
              type="number"
              min={1}
              value={draftFilters.actorUserId ?? ''}
              onChange={(event) =>
                onDraftChange({
                  ...draftFilters,
                  actorUserId: event.target.value ? Number(event.target.value) : undefined,
                })
              }
              placeholder="Ex.: 42"
            />
          </SettingsField>

          <SettingsField label="Ação">
            <SettingsSelect
              value={draftFilters.action ?? ''}
              onChange={(event) =>
                onDraftChange({
                  ...draftFilters,
                  action: event.target.value || undefined,
                })
              }
            >
              <option value="">Todas</option>
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </SettingsSelect>
          </SettingsField>

          <SettingsField label="Categoria">
            <SettingsSelect
              value={draftFilters.category ?? ''}
              onChange={(event) =>
                onDraftChange({
                  ...draftFilters,
                  category: (event.target.value || undefined) as AuditAdvancedFilters['category'],
                })
              }
            >
              <option value="">Todas</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {getAuditCategoryLabel(category)}
                </option>
              ))}
            </SettingsSelect>
          </SettingsField>

          <SettingsField label="Tipo recurso">
            <Input
              value={draftFilters.resourceType ?? ''}
              onChange={(event) =>
                onDraftChange({
                  ...draftFilters,
                  resourceType: event.target.value || undefined,
                })
              }
              placeholder="Ex.: report"
            />
          </SettingsField>

          <SettingsField label="ID recurso">
            <Input
              value={draftFilters.resourceId ?? ''}
              onChange={(event) =>
                onDraftChange({
                  ...draftFilters,
                  resourceId: event.target.value || undefined,
                })
              }
              placeholder="Ex.: 10"
            />
          </SettingsField>

          <SettingsField label="De">
            <Input
              type="date"
              value={draftFilters.from ? toDateInputValue(draftFilters.from) : ''}
              onChange={(event) =>
                onDraftChange({
                  ...draftFilters,
                  from: event.target.value ? dayStartIso(event.target.value) : undefined,
                })
              }
            />
          </SettingsField>

          <SettingsField label="Até">
            <Input
              type="date"
              value={draftFilters.to ? toDateInputValue(draftFilters.to) : ''}
              onChange={(event) =>
                onDraftChange({
                  ...draftFilters,
                  to: event.target.value ? dayEndIso(event.target.value) : undefined,
                })
              }
            />
          </SettingsField>
        </div>

        <div className="space-y-2">
          <span className="block text-xs font-medium text-vscode-text">Resultado</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por resultado">
            {OUTCOME_OPTIONS.map((option) => (
              <FilterOptionButton
                key={option.label}
                active={draftFilters.outcome === option.value}
                onClick={() =>
                  onDraftChange({
                    ...draftFilters,
                    outcome: option.value,
                  })
                }
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
              onClick={() => onApply(DEFAULT_ADVANCED_FILTERS)}
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
