import SettingsCard from '@/components/settings/SettingsCard'
import Alert from '@/components/ui/Alert'
import UserAccessReadOnlyList from '@/features/user/components/UserAccessReadOnlyList'
import UserReportAccessTransferList from '@/features/user/components/UserReportAccessTransferList'
import { useUserReportAccessState } from '@/features/user/hooks/use-user-report-access-state'
import type { ManagedUser } from '@/features/user/user-list-types'
import { BLOCKED_USER_REPORT_ACCESS_MESSAGE } from '@/features/user/user-blocked-messages'
import { isManagedUserBlocked } from '@/features/user/user-blocked-utils'
import { ApiError } from '@/features/auth/auth-types'

type UserReportAccessSectionProps = {
  user: ManagedUser
  enabled: boolean
}

export default function UserReportAccessSection({ user, enabled }: UserReportAccessSectionProps) {
  const accessState = useUserReportAccessState(user, enabled)
  const isUserBlocked = isManagedUserBlocked(user)

  const loadErrorMessage =
    accessState.loadError instanceof ApiError
      ? accessState.loadError.message
      : accessState.loadError instanceof Error
        ? accessState.loadError.message
        : 'Não foi possível carregar os relatórios deste usuário.'

  const isForbidden =
    accessState.loadError instanceof ApiError && accessState.loadError.statusCode === 403

  return (
    <SettingsCard className="flex h-full min-h-0 flex-col">
      <header className="mb-5 flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-vscode-text">Relatórios do usuário</h3>
          <p className="mt-1 text-xs text-vscode-text-muted">
            Selecione relatórios e mova entre as listas para conceder ou remover acesso.
            Na coluna &quot;Com acesso&quot;, use o botão IA para permitir conhecimento da IA.
          </p>
        </div>

        <span className="rounded-full border border-vscode-border px-3 py-1 text-xs text-vscode-text-muted">
          {accessState.grantedReports.length} com acesso
        </span>
      </header>

      {isUserBlocked && (
        <Alert variant="info" className="mb-4 shrink-0">
          {BLOCKED_USER_REPORT_ACCESS_MESSAGE}
        </Alert>
      )}

      {accessState.errorMessage && (
        <Alert variant="error" className="mb-4 shrink-0">
          Falha ao sincronizar acessos: {accessState.errorMessage}
        </Alert>
      )}

      {accessState.isLoading ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-vscode-border bg-vscode-sidebar px-6 py-16 text-sm text-vscode-text-muted">
          Carregando relatórios...
        </div>
      ) : accessState.isError ? (
        <Alert variant="error" className="shrink-0">
          {isForbidden
            ? 'Você não possui permissão para gerenciar acessos a relatórios deste usuário.'
            : loadErrorMessage}
        </Alert>
      ) : isUserBlocked ? (
        <div className="min-h-0 flex-1">
          <UserAccessReadOnlyList
            items={accessState.grantedReports}
            emptyMessage="Nenhum relatório com acesso concedido."
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1">
          <UserReportAccessTransferList
            userId={user.id}
            availableReports={accessState.availableReports}
            grantedReports={accessState.grantedReports}
            filteredAvailableReports={accessState.filteredAvailableReports}
            filteredGrantedReports={accessState.filteredGrantedReports}
            selectedAvailableIds={accessState.selectedAvailableIds}
            selectedGrantedIds={accessState.selectedGrantedIds}
            availableSearch={accessState.availableSearch}
            grantedSearch={accessState.grantedSearch}
            onAvailableSearchChange={accessState.setAvailableSearch}
            onGrantedSearchChange={accessState.setGrantedSearch}
            onToggleAvailableReport={(reportId) =>
              accessState.toggleReportSelection('available', reportId)
            }
            onToggleGrantedReport={(reportId) =>
              accessState.toggleReportSelection('granted', reportId)
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
            onToggleAiKnowledge={(reportId) => void accessState.toggleAiKnowledge(reportId)}
          />
        </div>
      )}
    </SettingsCard>
  )
}
