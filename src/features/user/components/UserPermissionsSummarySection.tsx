import clsx from 'clsx'
import {
  describePermissionAccess,
  describeRoleAccess,
  isAdminRuleName,
} from '@/features/user/user-permissions-mapper'
import {
  resolvePermissionIcon,
  resolveRuleIcon,
} from '@/features/user/user-permissions-icons'
import type { UserRuleOption } from '@/features/user/user-permissions-types'

type UserPermissionsSummarySectionProps = {
  catalog: UserRuleOption[]
  initialRuleIds: number[]
  initialPermissionIds: number[]
  className?: string
}

export default function UserPermissionsSummarySection({
  catalog,
  initialRuleIds,
  initialPermissionIds,
  className,
}: UserPermissionsSummarySectionProps) {
  return (
    <section
      className={clsx(
        'flex h-full min-h-0 flex-col rounded-lg border border-vscode-border bg-vscode-sidebar',
        className,
      )}
      aria-label="Resumo de permissões"
    >
      <header className="border-b border-vscode-border px-4 py-3">
        <h3 className="text-sm font-semibold text-vscode-text">Resumo de permissões</h3>
        <p className="mt-1 text-xs text-vscode-text-muted">
          As regras são exibidas com suas permissões. O ícone ativo indica apenas os acessos já
          salvos.
        </p>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {catalog.length === 0 ? (
          <p className="text-sm text-vscode-text-muted">Nenhuma regra disponível para resumo.</p>
        ) : (
          catalog.map((rule) => {
            const isRuleActive = initialRuleIds.includes(rule.id)
            const isAdminRule = isAdminRuleName(rule.nome)
            const hasRulePermissions = rule.permissoes.length > 0
            const activePermissionsCount = rule.permissoes.filter((permission) =>
              initialPermissionIds.includes(permission.id),
            ).length
            const ruleTooltip = describeRoleAccess(rule)

            return (
              <article
                key={`summary-rule-${rule.id}`}
                className="rounded-lg border border-vscode-border bg-vscode-bg/30 p-3"
              >
                <header className="flex items-start gap-3">
                  <span
                    className={clsx(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border',
                      isRuleActive
                        ? 'border-vscode-accent/30 bg-vscode-accent/10 text-vscode-accent'
                        : 'border-vscode-border bg-vscode-input-bg/40 text-vscode-text-muted/40',
                    )}
                    title={ruleTooltip}
                    aria-label={ruleTooltip}
                  >
                    {resolveRuleIcon(rule.nome, 'h-4 w-4')}
                  </span>

                  <div className="min-w-0 flex-1">
                    <strong className="block text-sm text-vscode-text">{rule.nome}</strong>
                    {!isAdminRule && hasRulePermissions && (
                      <small className="text-xs text-vscode-text-muted">
                        {activePermissionsCount}/{rule.permissoes.length} permissões ativas
                      </small>
                    )}
                  </div>
                </header>

                {rule.permissoes.length > 0 && (
                  <ul className="mt-3 space-y-2 border-t border-vscode-border/70 pt-3">
                    {rule.permissoes.map((permission) => {
                      const isPermissionActive = initialPermissionIds.includes(permission.id)
                      const permissionTooltip = describePermissionAccess(permission)

                      return (
                        <li
                          key={`summary-rule-${rule.id}-permission-${permission.id}`}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span
                            className={clsx(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded border',
                              isPermissionActive
                                ? 'border-vscode-accent/30 bg-vscode-accent/10 text-vscode-accent'
                                : 'border-vscode-border bg-vscode-input-bg/30 text-vscode-text-muted/40',
                            )}
                            title={permissionTooltip}
                            aria-label={permissionTooltip}
                          >
                            {resolvePermissionIcon(permission.nome, 'h-3.5 w-3.5')}
                          </span>
                          <span
                            className={clsx(
                              'min-w-0 break-all',
                              isPermissionActive ? 'text-vscode-text' : 'text-vscode-text-muted/60',
                            )}
                          >
                            {permission.nome}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
