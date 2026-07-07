import SettingsCard from '@/components/settings/SettingsCard'
import Alert from '@/components/ui/Alert'
import UserAccessTransferList from '@/features/user/components/UserAccessTransferList'
import { useUserDashboardAccessState } from '@/features/user/hooks/use-user-dashboard-access-state'
import type { ManagedUser } from '@/features/user/user-list-types'
import { ApiError } from '@/features/auth/auth-types'

type UserAccessTabProps = {
  user: ManagedUser
  enabled: boolean
}

export default function UserAccessTab({ user, enabled }: UserAccessTabProps) {
  const accessState = useUserDashboardAccessState(user, enabled)

  const loadErrorMessage =
    accessState.loadError instanceof ApiError
      ? accessState.loadError.message
      : accessState.loadError instanceof Error
        ? accessState.loadError.message
        : 'Não foi possível carregar os dashboards deste usuário.'

  const isForbidden =
    accessState.loadError instanceof ApiError && accessState.loadError.statusCode === 403

  return (
    <SettingsCard className="flex h-full min-h-0 flex-col">
      <header className="mb-5 flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-vscode-text">Acessos do usuário</h3>
          <p className="mt-1 text-xs text-vscode-text-muted">
            Selecione dashboards e mova entre as listas para conceder ou remover acesso.
          </p>
        </div>

        <span className="rounded-full border border-vscode-border px-3 py-1 text-xs text-vscode-text-muted">
          {accessState.grantedDashboards.length} com acesso
        </span>
      </header>

      {user.bloqueado && (
        <Alert variant="info" className="mb-4 shrink-0">
          Usuário bloqueado. Não é possível alterar os acessos a dashboards.
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
  )
}
