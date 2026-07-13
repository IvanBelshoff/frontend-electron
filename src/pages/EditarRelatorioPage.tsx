import { Link, useParams } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import Alert from '@/components/ui/Alert'
import { hasPermission } from '@/features/auth/rbac'
import { REPORT_RBAC } from '@/features/auth/rbac-requirements'
import { useRbac } from '@/features/auth/use-rbac'
import ReportAccessTab from '@/features/reports/components/ReportAccessTab'
import ReportDeleteConfirmDialog from '@/features/reports/components/ReportDeleteConfirmDialog'
import ReportEditForm from '@/features/reports/components/ReportEditForm'
import ReportEditHeader from '@/features/reports/components/ReportEditHeader'
import ReportEditTabs from '@/features/reports/components/ReportEditTabs'
import ReportExecutionTab from '@/features/reports/components/ReportExecutionTab'
import ReportInfoSection from '@/features/reports/components/ReportInfoSection'
import ReportScheduleTab from '@/features/reports/components/ReportScheduleTab'
import { useReportDeleteDialog } from '@/features/reports/hooks/use-report-delete-dialog'
import { useReportEditState } from '@/features/reports/hooks/use-report-edit-state'
import type { ReportEditTab } from '@/features/reports/report-types'
import { ApiError } from '@/features/auth/auth-types'

export default function EditarRelatorioPage() {
  const { relatorioId: relatorioIdParam } = useParams({ strict: false })
  const relatorioId = Number(relatorioIdParam)
  const rbac = useRbac()
  const canUpdate = hasPermission(rbac, REPORT_RBAC.update)
  const canDelete = hasPermission(rbac, REPORT_RBAC.delete)
  const canManageAccess = hasPermission(rbac, REPORT_RBAC.grantAccess)

  const {
    report,
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
  } = useReportEditState(relatorioId)

  const deleteDialog = useReportDeleteDialog({ redirectToListOnSuccess: true })

  const isScheduleTabAvailable = report?.estado === 'offline'

  const disabledTabs = useMemo(() => {
    const tabs: ReportEditTab[] = []

    if (!canManageAccess) {
      tabs.push('access')
    }

    if (!isScheduleTabAvailable) {
      tabs.push('schedule')
    }

    return tabs
  }, [canManageAccess, isScheduleTabAvailable])

  const disabledTabTitles = useMemo(
    () => ({
      access: 'Você não possui permissão para acessar esta seção.',
      schedule: 'Disponível apenas para relatórios offline.',
    }),
    [],
  )

  useEffect(() => {
    if (activeTab === 'schedule' && !isScheduleTabAvailable) {
      setActiveTab('report')
    }
  }, [activeTab, isScheduleTabAvailable, setActiveTab])

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Não foi possível carregar o relatório.'

  const isNotFound =
    error instanceof ApiError && (error.statusCode === 404 || error.statusCode === 403)

  if (!Number.isFinite(relatorioId) || relatorioId <= 0) {
    return (
      <div className="space-y-4">
        <Alert variant="error">Identificador de relatório inválido.</Alert>
        <Link to="/relatorios/gerenciar" className="text-sm text-vscode-accent hover:underline">
          Voltar para a listagem
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
        <ReportEditHeader
          reportName={report?.nome ?? 'Carregando...'}
          isRefreshing={isRefreshing}
          onRefresh={refresh}
          onDelete={() => {
            if (report) {
              deleteDialog.requestDelete(report)
            }
          }}
          canDelete={canDelete}
        />

        <ReportEditTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          disabledTabs={disabledTabs}
          disabledTabTitles={disabledTabTitles}
        />
      </div>

      <div
        className={
          activeTab === 'access' || activeTab === 'execution' || activeTab === 'schedule'
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden pt-4'
            : 'min-h-0 flex-1 overflow-y-auto pt-4'
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center rounded-lg border border-vscode-border bg-vscode-sidebar px-6 py-16 text-sm text-vscode-text-muted">
            Carregando relatório...
          </div>
        ) : isError || !report || !draft ? (
          <div className="space-y-4">
            <Alert variant="error">
              {isNotFound ? 'Relatório não encontrado ou sem permissão.' : errorMessage}
            </Alert>
            <Link to="/relatorios/gerenciar" className="text-sm text-vscode-accent hover:underline">
              Voltar para a listagem
            </Link>
          </div>
        ) : activeTab === 'report' ? (
          <div className="space-y-4">
            <ReportEditForm
              draft={draft}
              defaultIcon={report.icone}
              updateDraft={updateDraft}
              fieldErrors={fieldErrors}
              isDirty={isDirty}
              isSaving={isSaving}
              saveSuccess={saveSuccess}
              onSave={saveEdit}
              onCancel={cancelEdit}
              canUpdate={canUpdate}
            />
            <ReportInfoSection report={report} />
          </div>
        ) : activeTab === 'access' ? (
          canManageAccess ? (
            <ReportAccessTab reportId={relatorioId} report={report} enabled={activeTab === 'access'} />
          ) : (
            <Alert variant="warning">
              Você não possui permissão para gerenciar acessos deste relatório.
            </Alert>
          )
        ) : activeTab === 'execution' ? (
          <ReportExecutionTab
            reportId={relatorioId}
            report={report}
            enabled={activeTab === 'execution'}
          />
        ) : (
          <ReportScheduleTab
            reportId={relatorioId}
            report={report}
            enabled={activeTab === 'schedule'}
            canUpdate={canUpdate}
          />
        )}
      </div>

      <ReportDeleteConfirmDialog
        isOpen={deleteDialog.deleteTarget !== null}
        reportName={deleteDialog.deleteTarget?.nome ?? ''}
        isDeleting={deleteDialog.isDeleting}
        error={deleteDialog.error}
        onConfirm={() => void deleteDialog.confirmDelete()}
        onCancel={deleteDialog.cancelDelete}
      />
    </div>
  )
}
