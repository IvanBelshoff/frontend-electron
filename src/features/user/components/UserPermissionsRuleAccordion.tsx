import clsx from 'clsx'
import { ChevronDownIcon, ChevronUpIcon } from '@/features/dashboards/icons/DashboardIcons'
import { isAdminRuleName } from '@/features/user/user-permissions-mapper'
import {
  resolvePermissionIcon,
  resolveRuleIcon,
} from '@/features/user/user-permissions-icons'
import type { UserRuleOption } from '@/features/user/user-permissions-types'

type UserPermissionsRuleAccordionProps = {
  rule: UserRuleOption
  expanded: boolean
  isRuleSelected: boolean
  selectedPermissionIds: number[]
  disabled: boolean
  onToggleExpand: () => void
  onToggleRule: (checked: boolean) => void
  onTogglePermission: (permissionId: number, checked: boolean) => void
}

export default function UserPermissionsRuleAccordion({
  rule,
  expanded,
  isRuleSelected,
  selectedPermissionIds,
  disabled,
  onToggleExpand,
  onToggleRule,
  onTogglePermission,
}: UserPermissionsRuleAccordionProps) {
  const isAdminRule = isAdminRuleName(rule.nome)
  const hasRulePermissions = rule.permissoes.length > 0
  const selectedPermissionsCount = rule.permissoes.filter((permission) =>
    selectedPermissionIds.includes(permission.id),
  ).length

  return (
    <article
      className={clsx(
        'rounded-lg border border-vscode-border bg-vscode-bg/30',
        disabled && 'opacity-60',
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        {hasRulePermissions ? (
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-vscode-text-muted transition-colors hover:bg-vscode-accent/10 hover:text-vscode-text"
            onClick={onToggleExpand}
            aria-expanded={expanded}
            aria-label={expanded ? `Recolher ${rule.nome}` : `Expandir ${rule.nome}`}
          >
            {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
        ) : (
          <span className="inline-flex h-8 w-8 shrink-0" aria-hidden="true" />
        )}

        <button
          type="button"
          className={clsx(
            'flex min-w-0 flex-1 items-center gap-2 text-left',
            hasRulePermissions && 'cursor-pointer',
          )}
          onClick={hasRulePermissions ? onToggleExpand : undefined}
          disabled={!hasRulePermissions}
        >
          <span
            className={clsx(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border',
              isRuleSelected
                ? 'border-vscode-accent/30 bg-vscode-accent/10 text-vscode-accent'
                : 'border-vscode-border bg-vscode-input-bg/40 text-vscode-text-muted',
            )}
          >
            {resolveRuleIcon(rule.nome, 'h-4 w-4')}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-vscode-text">{rule.nome}</span>
            {!isAdminRule && hasRulePermissions && (
              <span className="text-xs text-vscode-text-muted">
                {selectedPermissionsCount}/{rule.permissoes.length} permissões
              </span>
            )}
          </span>
        </button>

        <label
          className={clsx(
            'inline-flex shrink-0 items-center gap-2 text-xs text-vscode-text-muted',
            disabled && 'cursor-not-allowed',
          )}
        >
          <input
            type="checkbox"
            checked={isRuleSelected}
            disabled={disabled}
            onChange={(event) => onToggleRule(event.target.checked)}
            className="h-4 w-4 rounded border-vscode-border accent-vscode-accent disabled:cursor-not-allowed"
          />
          <span className="hidden sm:inline">Regra ativa</span>
        </label>
      </div>

      {expanded && hasRulePermissions && (
        <div className="border-t border-vscode-border/70 px-3 py-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {rule.permissoes.map((permission) => {
              const isPermissionSelected = selectedPermissionIds.includes(permission.id)

              return (
                <label
                  key={`rule-${rule.id}-permission-${permission.id}`}
                  className={clsx(
                    'flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 transition-colors',
                    isPermissionSelected
                      ? 'border-vscode-accent/30 bg-vscode-accent/10'
                      : 'border-vscode-border bg-vscode-input-bg/20 hover:border-vscode-accent/20',
                    disabled && 'cursor-not-allowed opacity-60',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isPermissionSelected}
                    disabled={disabled}
                    onChange={(event) =>
                      onTogglePermission(permission.id, event.target.checked)
                    }
                    className="h-4 w-4 shrink-0 rounded border-vscode-border accent-vscode-accent disabled:cursor-not-allowed"
                  />
                  <span
                    className={clsx(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded border',
                      isPermissionSelected
                        ? 'border-vscode-accent/30 text-vscode-accent'
                        : 'border-vscode-border text-vscode-text-muted',
                    )}
                  >
                    {resolvePermissionIcon(permission.nome, 'h-3.5 w-3.5')}
                  </span>
                  <span className="min-w-0 break-all text-xs text-vscode-text">
                    {permission.nome}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </article>
  )
}
