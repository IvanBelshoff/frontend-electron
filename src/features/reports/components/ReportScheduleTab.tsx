import { useState } from 'react'
import SettingsCard from '@/components/settings/SettingsCard'
import SettingsCardHeader from '@/components/settings/SettingsCardHeader'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import ReportScheduleForm from '@/features/reports/components/ReportScheduleForm'
import ReportSnapshotHistoryTable from '@/features/reports/components/ReportSnapshotHistoryTable'
import { useReportSnapshotScheduleState } from '@/features/reports/hooks/use-report-snapshot-schedule-state'
import type { Report } from '@/features/reports/report-types'

type ReportScheduleTabProps = {
  reportId: number
  report: Report
  enabled: boolean
  canUpdate: boolean
}

export default function ReportScheduleTab({
  reportId,
  report,
  enabled,
  canUpdate,
}: ReportScheduleTabProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const {
    schedule,
    hasSchedule,
    scheduleDraft,
    updateScheduleDraft,
    parametrosSnapshot,
    setParametrosSnapshot,
    snapshotHistory,
    isLoading,
    isLoadingHistory,
    isFetchingHistory,
    isSaving,
    isDeleting,
    isDirty,
    saveError,
    saveSuccess,
    deleteError,
    saveSchedule,
    removeSchedule,
    refreshHistory,
    scheduleError,
    historyError,
  } = useReportSnapshotScheduleState(reportId, report, enabled)

  const readOnly = !canUpdate

  const handleRemove = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    await removeSchedule()
    setConfirmDelete(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-vscode-text-muted">
        Carregando agendamento...
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 pb-4">
      <Alert variant="info">
        O agendamento renova automaticamente o snapshot deste relatório offline. Se o relatório
        voltar para online, o vínculo é pausado automaticamente.
      </Alert>

      {scheduleError && (
        <Alert variant="error">
          {scheduleError instanceof Error
            ? scheduleError.message
            : 'Não foi possível carregar o agendamento.'}
        </Alert>
      )}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[2fr_3fr]">
        <SettingsCard className="flex min-h-0 min-w-0 flex-col">
          <SettingsCardHeader
            icon={<DashboardMaterialIcon name="schedule" className="text-[1.15rem]" />}
            title="Configuração do agendamento"
            description={
              hasSchedule
                ? 'Atualize a recorrência ou remova o agendamento existente.'
                : 'Defina quando o snapshot offline deve ser regenerado automaticamente.'
            }
          />

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <ReportScheduleForm
              draft={scheduleDraft}
              onChange={updateScheduleDraft}
              parametros={report.parametros ?? []}
              parametrosSnapshot={parametrosSnapshot}
              onParametrosChange={setParametrosSnapshot}
              agendamento={schedule?.agendamento ?? null}
              readOnly={readOnly}
            />

            {saveError && <Alert variant="error">{saveError}</Alert>}
            {deleteError && <Alert variant="error">{deleteError}</Alert>}
            {saveSuccess && <Alert variant="success">Agendamento salvo com sucesso.</Alert>}
          </div>

          {canUpdate && (
            <div className="mt-4 flex shrink-0 flex-wrap gap-3 border-t border-vscode-border pt-4">
              <Button
                variant="primary"
                onClick={() => void saveSchedule()}
                loading={isSaving}
                disabled={!isDirty && hasSchedule}
              >
                {hasSchedule ? 'Salvar alterações' : 'Criar agendamento'}
              </Button>

              {hasSchedule && (
                <Button
                  variant={confirmDelete ? 'danger' : 'secondary'}
                  onClick={() => void handleRemove()}
                  loading={isDeleting}
                >
                  {confirmDelete ? 'Confirmar remoção' : 'Remover agendamento'}
                </Button>
              )}

              {confirmDelete && !isDeleting && (
                <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                  Cancelar
                </Button>
              )}
            </div>
          )}
        </SettingsCard>

        <div className="min-h-0 overflow-y-auto">
          <SettingsCard className="h-full">
            <SettingsCardHeader
              icon={<DashboardMaterialIcon name="history" className="text-[1.15rem]" />}
              title="Histórico de atualizações"
              description="Snapshots manuais e execuções do agendamento."
            />

            {historyError && (
              <Alert variant="error">
                {historyError instanceof Error
                  ? historyError.message
                  : 'Não foi possível carregar o histórico.'}
              </Alert>
            )}

            <ReportSnapshotHistoryTable
              items={snapshotHistory}
              isLoading={isLoadingHistory}
              isRefreshing={isFetchingHistory}
              onRefresh={refreshHistory}
            />
          </SettingsCard>
        </div>
      </div>
    </div>
  )
}
