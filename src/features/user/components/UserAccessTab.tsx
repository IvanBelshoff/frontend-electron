import clsx from 'clsx'
import { useEffect, useState } from 'react'
import SettingsCard from '@/components/settings/SettingsCard'
import Alert from '@/components/ui/Alert'
import UserAccessReadOnlyList from '@/features/user/components/UserAccessReadOnlyList'
import UserAccessTransferList from '@/features/user/components/UserAccessTransferList'
import UserReportAccessSection from '@/features/user/components/UserReportAccessSection'
import { useUserDashboardAccessState } from '@/features/user/hooks/use-user-dashboard-access-state'
import type { ManagedUser } from '@/features/user/user-list-types'
import { BLOCKED_USER_DASHBOARD_ACCESS_MESSAGE } from '@/features/user/user-blocked-messages'
import { isManagedUserBlocked } from '@/features/user/user-blocked-utils'
import { ApiError } from '@/features/auth/auth-types'

type UserAccessTabProps = {
  user: ManagedUser
  enabled: boolean
  canManageDashboardAccess?: boolean
  canManageReportAccess?: boolean
}

type AccessSection = 'dashboards' | 'reports'

export default function UserAccessTab({
  user,
  enabled,
  canManageDashboardAccess = true,
  canManageReportAccess = true,
}: UserAccessTabProps) {
  const defaultSection: AccessSection = canManageDashboardAccess
    ? 'dashboards'
    : canManageReportAccess
      ? 'reports'
      : 'dashboards'

  const [activeSection, setActiveSection] = useState<AccessSection>(defaultSection)
  const isUserBlocked = isManagedUserBlocked(user)

  useEffect(() => {
    if (activeSection === 'dashboards' && !canManageDashboardAccess && canManageReportAccess) {
      setActiveSection('reports')
    }

    if (activeSection === 'reports' && !canManageReportAccess && canManageDashboardAccess) {
      setActiveSection('dashboards')
    }
  }, [activeSection, canManageDashboardAccess, canManageReportAccess])

  const accessState = useUserDashboardAccessState(
    user,
    enabled && activeSection === 'dashboards' && canManageDashboardAccess,
  )

  const loadErrorMessage =
    accessState.loadError instanceof ApiError
      ? accessState.loadError.message
      : accessState.loadError instanceof Error
        ? accessState.loadError.message
        : 'Não foi possível carregar os dashboards deste usuário.'

  const isForbidden =
    accessState.loadError instanceof ApiError && accessState.loadError.statusCode === 403

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex justify-center">
        <div
          className="inline-flex rounded-lg border border-vscode-border bg-vscode-input-bg/50 p-1"
          role="tablist"
          aria-label="Tipo de acesso"
        >
          {(
            [
              { id: 'dashboards' as const, label: 'Dashboards', enabled: canManageDashboardAccess },
              { id: 'reports' as const, label: 'Relatórios', enabled: canManageReportAccess },
            ] as const
          ).map((section) => (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={activeSection === section.id}
              disabled={!section.enabled}
              onClick={() => setActiveSection(section.id)}
              title={
                section.enabled
                  ? undefined
                  : 'Você não possui permissão para gerenciar este tipo de acesso.'
              }
              className={clsx(
                'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                activeSection === section.id
                  ? 'border border-vscode-accent bg-vscode-accent/10 text-vscode-text shadow-sm'
                  : 'border border-transparent text-vscode-text-muted hover:bg-vscode-sidebar hover:text-vscode-text',
                !section.enabled &&
                  'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-vscode-text-muted',
              )}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {activeSection === 'reports' ? (
        canManageReportAccess ? (
          <UserReportAccessSection key={user.id} user={user} enabled={enabled} />
        ) : (
          <Alert variant="warning">
            Você não possui permissão para gerenciar acessos a relatórios deste usuário.
          </Alert>
        )
      ) : canManageDashboardAccess ? (
        <SettingsCard className="flex h-full min-h-0 flex-col">
          <header className="mb-5 flex shrink-0 flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-vscode-text">Dashboards do usuário</h3>
              <p className="mt-1 text-xs text-vscode-text-muted">
                Selecione dashboards e mova entre as listas para conceder ou remover acesso.
              </p>
            </div>

            <span className="rounded-full border border-vscode-border px-3 py-1 text-xs text-vscode-text-muted">
              {accessState.grantedDashboards.length} com acesso
            </span>
          </header>

          {isUserBlocked && (
            <Alert variant="info" className="mb-4 shrink-0">
              {BLOCKED_USER_DASHBOARD_ACCESS_MESSAGE}
            </Alert>
          )}

          {accessState.errorMessage && (
            <Alert variant="error" className="mb-4 shrink-0">
              Falha ao sincronizar acessos: {accessState.errorMessage}
            </Alert>
          )}

          {accessState.isLoading ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-vscode-border bg-vscode-sidebar px-6 py-16 text-sm text-vscode-text-muted">
              Carregando dashboards...
            </div>
          ) : accessState.isError ? (
            <Alert variant="error" className="shrink-0">
              {isForbidden
                ? 'Você não possui permissão para gerenciar acessos a dashboards deste usuário.'
                : loadErrorMessage}
            </Alert>
          ) : isUserBlocked ? (
            <div className="min-h-0 flex-1">
              <UserAccessReadOnlyList
                items={accessState.grantedDashboards}
                emptyMessage="Nenhum dashboard com acesso concedido."
              />
            </div>
          ) : (
            <div className="min-h-0 flex-1">
              <UserAccessTransferList
                userId={user.id}
                availableDashboards={accessState.availableDashboards}
                grantedDashboards={accessState.grantedDashboards}
                filteredAvailableDashboards={accessState.filteredAvailableDashboards}
                filteredGrantedDashboards={accessState.filteredGrantedDashboards}
                selectedAvailableIds={accessState.selectedAvailableIds}
                selectedGrantedIds={accessState.selectedGrantedIds}
                availableSearch={accessState.availableSearch}
                grantedSearch={accessState.grantedSearch}
                onAvailableSearchChange={accessState.setAvailableSearch}
                onGrantedSearchChange={accessState.setGrantedSearch}
                onToggleAvailableDashboard={(dashboardId) =>
                  accessState.toggleDashboardSelection('available', dashboardId)
                }
                onToggleGrantedDashboard={(dashboardId) =>
                  accessState.toggleDashboardSelection('granted', dashboardId)
                }
                onToggleSelectAllAvailable={() => accessState.toggleSelectAll('available')}
                onToggleSelectAllGranted={() => accessState.toggleSelectAll('granted')}
                isAllAvailableSelected={accessState.isAllSelected('available')}
                isAllGrantedSelected={accessState.isAllSelected('granted')}
                onMoveSelectedRight={() => void accessState.moveSelectedRight()}
                onMoveAllRight={() => void accessState.moveAllRight()}
                onMoveSelectedLeft={() => void accessState.moveSelectedLeft()}
                onMoveAllLeft={() => void accessState.moveAllLeft()}
                disabled={accessState.controlsDisabled || accessState.isSaving}
              />
            </div>
          )}
        </SettingsCard>
      ) : (
        <Alert variant="warning">
          Você não possui permissão para gerenciar acessos a dashboards deste usuário.
        </Alert>
      )}
    </div>
  )
}
