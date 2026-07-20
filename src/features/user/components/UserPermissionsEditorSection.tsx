import clsx from 'clsx'
import { RefreshIcon } from '@/components/settings/SettingsIcons'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import UserPermissionsRuleAccordion from '@/features/user/components/UserPermissionsRuleAccordion'
import { isAdminRuleName } from '@/features/user/user-permissions-mapper'
import { BLOCKED_USER_PERMISSIONS_MESSAGE } from '@/features/user/user-blocked-messages'
import type { UserRuleOption } from '@/features/user/user-permissions-types'

type UserPermissionsEditorSectionProps = {
  catalog: UserRuleOption[]
  selectedRuleIds: number[]
  selectedPermissionIds: number[]
  expandedRuleIds: number[]
  isDirty: boolean
  isAdminLockActive: boolean
  isUserBlocked?: boolean
  isSaving: boolean
  saveSuccess: boolean
  saveError: string | null
  isLoading: boolean
  isError: boolean
  errorMessage: string
  onToggleAccordion: (ruleId: number) => void
  onToggleRule: (rule: UserRuleOption, checked: boolean) => void
  onTogglePermission: (ruleId: number, permissionId: number, checked: boolean) => void
  onReset: () => void
  onSave: () => void
  onRetry: () => void
  className?: string
}

export default function UserPermissionsEditorSection({
  catalog,
  selectedRuleIds,
  selectedPermissionIds,
  expandedRuleIds,
  isDirty,
  isAdminLockActive,
  isUserBlocked = false,
  isSaving,
  saveSuccess,
  saveError,
  isLoading,
  isError,
  errorMessage,
  onToggleAccordion,
  onToggleRule,
  onTogglePermission,
  onReset,
  onSave,
  onRetry,
  className,
}: UserPermissionsEditorSectionProps) {
  return (
    <section
      className={clsx(
        'flex h-full min-h-0 flex-col rounded-lg border border-vscode-border bg-vscode-sidebar',
        className,
      )}
      aria-label="Configuração de regras e permissões"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-vscode-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-vscode-text">Regras e permissões</h3>
          <p className="mt-1 text-xs text-vscode-text-muted">
            Expanda cada regra para definir as permissões vinculadas ao usuário.
          </p>
        </div>

        {(isDirty || isSaving) && !isUserBlocked && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isSaving || !isDirty}
              onClick={onReset}
              className="gap-1.5"
            >
              <RefreshIcon className="h-4 w-4" />
              Restaurar
            </Button>
            <Button type="button" size="sm" loading={isSaving} disabled={!isDirty} onClick={onSave}>
              Salvar
            </Button>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {isUserBlocked && (
          <Alert variant="info">{BLOCKED_USER_PERMISSIONS_MESSAGE}</Alert>
        )}

        {saveError && <Alert variant="error">{saveError}</Alert>}

        {saveSuccess && !isDirty && (
          <Alert variant="success">Permissões atualizadas com sucesso.</Alert>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-vscode-border bg-vscode-bg/30 px-4 py-8 text-center text-sm text-vscode-text-muted">
            Carregando regras e permissões disponíveis...
          </div>
        ) : isError ? (
          <div className="space-y-3">
            <Alert variant="error">{errorMessage}</Alert>
            <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
              Tentar novamente
            </Button>
          </div>
        ) : catalog.length === 0 ? (
          <Alert variant="info">
            Nenhuma regra foi encontrada para configurar permissões neste ambiente.
          </Alert>
        ) : (
          <div className="space-y-2">
            {catalog.map((rule) => {
              const isExpanded = expandedRuleIds.includes(rule.id)
              const isRuleSelected = selectedRuleIds.includes(rule.id)
              const isAdminRule = isAdminRuleName(rule.nome)
              const shouldDisableRuleSelection =
                isUserBlocked || (isAdminLockActive && !isAdminRule)

              return (
                <UserPermissionsRuleAccordion
                  key={`rule-accordion-${rule.id}`}
                  rule={rule}
                  expanded={isExpanded}
                  isRuleSelected={isRuleSelected}
                  selectedPermissionIds={selectedPermissionIds}
                  disabled={shouldDisableRuleSelection}
                  onToggleExpand={() => onToggleAccordion(rule.id)}
                  onToggleRule={(checked) => onToggleRule(rule, checked)}
                  onTogglePermission={(permissionId, checked) =>
                    onTogglePermission(rule.id, permissionId, checked)
                  }
                />
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
