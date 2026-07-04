import { Link, useParams } from '@tanstack/react-router'
import Alert from '@/components/ui/Alert'
import DashboardAccessTab from '@/features/dashboards/components/DashboardAccessTab'
import DashboardDeleteConfirmDialog from '@/features/dashboards/components/DashboardDeleteConfirmDialog'
import DashboardEditForm from '@/features/dashboards/components/DashboardEditForm'
import DashboardEditHeader from '@/features/dashboards/components/DashboardEditHeader'
import DashboardEditTabs from '@/features/dashboards/components/DashboardEditTabs'
import DashboardInfoSection from '@/features/dashboards/components/DashboardInfoSection'
import DashboardPreviewTab from '@/features/dashboards/components/DashboardPreviewTab'
import { useDashboardDeleteDialog } from '@/features/dashboards/hooks/use-dashboard-delete-dialog'
import { useDashboardEditState } from '@/features/dashboards/hooks/use-dashboard-edit-state'
import { ApiError } from '@/features/auth/auth-types'

export default function EditarDashboardPage() {
  const { dashboardId: dashboardIdParam } = useParams({ strict: false })
  const dashboardId = Number(dashboardIdParam)

  const {
    dashboard,
    draft,
    activeTab,
    setActiveTab,
    updateDraft,
    isDirty,
    fieldErrors,
    saveSuccess,
    saveEdit,
    cancelEdit,
    refresh,
    isLoading,
    isError,
    error,
    isSaving,
    isRefreshing,
  } = useDashboardEditState(dashboardId)

  const deleteDialog = useDashboardDeleteDialog({ redirectToListOnSuccess: true })

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Não foi possível carregar o dashboard.'

  const isNotFound =
    error instanceof ApiError && (error.statusCode === 404 || error.statusCode === 403)

  if (!Number.isFinite(dashboardId) || dashboardId <= 0) {
    return (
      <div className="space-y-4">
        <Alert variant="error">Identificador de dashboard inválido.</Alert>
        <Link to="/dashboards" className="text-sm text-vscode-accent hover:underline">
          Voltar para a listagem
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
        <DashboardEditHeader
          dashboardName={dashboard?.nome ?? 'Carregando...'}
          isRefreshing={isRefreshing}
          onRefresh={refresh}
          onDelete={() => {
            if (dashboard) {
              deleteDialog.requestDelete(dashboard)
            }
          }}
        />

        <DashboardEditTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div
        className={
          activeTab === 'access' || activeTab === 'preview'
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden pt-4'
            : 'min-h-0 flex-1 overflow-y-auto pt-4'
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center rounded-lg border border-vscode-border bg-vscode-sidebar px-6 py-16 text-sm text-vscode-text-muted">
            Carregando dashboard...
          </div>
        ) : isError || !dashboard || !draft ? (
          <div className="space-y-4">
            <Alert variant="error">
              {isNotFound ? 'Dashboard não encontrado ou sem permissão.' : errorMessage}
            </Alert>
            <Link to="/dashboards" className="text-sm text-vscode-accent hover:underline">
              Voltar para a listagem
            </Link>
          </div>
        ) : activeTab === 'dashboard' ? (
          <div className="space-y-4">
            <DashboardEditForm
              draft={draft}
              defaultIcon={dashboard.icone}
              updateDraft={updateDraft}
              fieldErrors={fieldErrors}
              isDirty={isDirty}
              isSaving={isSaving}
              saveSuccess={saveSuccess}
              onSave={saveEdit}
              onCancel={cancelEdit}
            />
            <DashboardInfoSection dashboard={dashboard} />
          </div>
        ) : activeTab === 'access' ? (
          <DashboardAccessTab
            dashboardId={dashboardId}
            dashboard={dashboard}
            enabled={activeTab === 'access'}
          />
        ) : (
          <DashboardPreviewTab dashboardName={dashboard.nome} url={dashboard.url} />
        )}
      </div>

      <DashboardDeleteConfirmDialog
        isOpen={deleteDialog.deleteTarget !== null}
        dashboardName={deleteDialog.deleteTarget?.nome ?? ''}
        isDeleting={deleteDialog.isDeleting}
        error={deleteDialog.error}
        onConfirm={() => void deleteDialog.confirmDelete()}
        onCancel={deleteDialog.cancelDelete}
      />
    </div>
  )
}
