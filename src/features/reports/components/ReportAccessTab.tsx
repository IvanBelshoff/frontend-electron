import SettingsCard from '@/components/settings/SettingsCard'
import Alert from '@/components/ui/Alert'
import DashboardAccessTransferList from '@/features/dashboards/components/DashboardAccessTransferList'
import { useReportAccessState } from '@/features/reports/hooks/use-report-access-state'
import type { Report } from '@/features/reports/report-types'

type ReportAccessTabProps = {
  reportId: number
  report: Report
  enabled: boolean
}

export default function ReportAccessTab({ reportId, report, enabled }: ReportAccessTabProps) {
  const {
    isPublicReport,
    ownerId,
    availableUsers,
    grantedUsers,
    filteredAvailableUsers,
    filteredGrantedUsers,
    selectedAvailableIds,
    selectedGrantedIds,
    availableSearch,
    setAvailableSearch,
    grantedSearch,
    setGrantedSearch,
    toggleUserSelection,
    toggleSelectAll,
    isAllSelected,
    moveSelectedRight,
    moveAllRight,
    moveSelectedLeft,
    moveAllLeft,
    moveItem,
    isLoading,
    isSaving,
    isError,
    errorMessage,
    controlsDisabled,
    toggleAiKnowledge,
  } = useReportAccessState(reportId, report, enabled)

  return (
    <SettingsCard className="flex h-full min-h-0 flex-col">
      <header className="mb-5 flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-vscode-text">Acessos ao relatório</h3>
          <p className="mt-1 text-xs text-vscode-text-muted">
            Selecione usuários e mova entre as listas para conceder ou remover acesso.
            Na coluna &quot;Com acesso&quot;, use o botão IA para permitir conhecimento da IA.
          </p>
        </div>

        <span className="rounded-full border border-vscode-border px-3 py-1 text-xs text-vscode-text-muted">
          {grantedUsers.length} com acesso
        </span>
      </header>

      {isPublicReport && (
        <Alert variant="info" className="mb-4 shrink-0">
          Relatórios públicos não permitem configuração manual de usuários com acesso.
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="error" className="mb-4 shrink-0">
          Falha ao sincronizar acessos: {errorMessage}
        </Alert>
      )}

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-vscode-border bg-vscode-sidebar px-6 py-16 text-sm text-vscode-text-muted">
          Carregando usuários...
        </div>
      ) : isError ? (
        <Alert variant="error" className="shrink-0">
          Não foi possível carregar os usuários deste relatório.
        </Alert>
      ) : (
        <div className="min-h-0 flex-1">
          <DashboardAccessTransferList
            availableUsers={availableUsers}
            grantedUsers={grantedUsers}
            filteredAvailableUsers={filteredAvailableUsers}
            filteredGrantedUsers={filteredGrantedUsers}
            selectedAvailableIds={selectedAvailableIds}
            selectedGrantedIds={selectedGrantedIds}
            availableSearch={availableSearch}
            grantedSearch={grantedSearch}
            onAvailableSearchChange={setAvailableSearch}
            onGrantedSearchChange={setGrantedSearch}
            onToggleAvailableUser={(userId) => toggleUserSelection('available', userId)}
            onToggleGrantedUser={(userId) => toggleUserSelection('granted', userId)}
            onToggleSelectAllAvailable={() => toggleSelectAll('available')}
            onToggleSelectAllGranted={() => toggleSelectAll('granted')}
            isAllAvailableSelected={isAllSelected('available')}
            isAllGrantedSelected={isAllSelected('granted')}
            onMoveSelectedRight={() => void moveSelectedRight()}
            onMoveAllRight={() => void moveAllRight()}
            onMoveSelectedLeft={() => void moveSelectedLeft()}
            onMoveAllLeft={() => void moveAllLeft()}
            onMoveItem={moveItem}
            disabled={controlsDisabled || isSaving}
            ownerId={ownerId}
            showAiKnowledge
            onToggleAiKnowledge={(userId) => void toggleAiKnowledge(userId)}
          />
        </div>
      )}
    </SettingsCard>
  )
}
