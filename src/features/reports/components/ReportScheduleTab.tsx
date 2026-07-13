import { useState } from 'react'
import SettingsCard from '@/components/settings/SettingsCard'
import SettingsCardHeader from '@/components/settings/SettingsCardHeader'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import ReportScheduleExecutionsTable from '@/features/reports/components/ReportScheduleExecutionsTable'
import ReportScheduleForm from '@/features/reports/components/ReportScheduleForm'
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
    executions,
    isLoading,
    isLoadingExecutions,
    isFetchingExecutions,
    isSaving,
    isDeleting,
    isDirty,
    saveError,
    saveSuccess,
    deleteError,
    saveSchedule,
    removeSchedule,
    refreshExecutions,
    scheduleError,
    executionsError,
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
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pb-4">
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

      <SettingsCard>
        <SettingsCardHeader
          icon={<DashboardMaterialIcon name="schedule" className="text-[1.15rem]" />}
          title="Configuração do agendamento"
          description={
            hasSchedule
              ? 'Atualize a recorrência ou remova o agendamento existente.'
              : 'Defina quando o snapshot offline deve ser regenerado automaticamente.'
          }
        />

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
        {saveSuccess && (
          <Alert variant="success">Agendamento salvo com sucesso.</Alert>
        )}

        {canUpdate && (
          <div className="mt-6 flex flex-wrap gap-3">
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

      <SettingsCard>
        <SettingsCardHeader
          icon={<DashboardMaterialIcon name="history" className="text-[1.15rem]" />}
          title="Histórico de execuções"
          description="Últimas execuções disparadas pelo agendamento de snapshot."
        />

        {executionsError && (
          <Alert variant="error">
            {executionsError instanceof Error
              ? executionsError.message
              : 'Não foi possível carregar o histórico.'}
          </Alert>
        )}

        <ReportScheduleExecutionsTable
          executions={executions}
          isLoading={isLoadingExecutions}
          isRefreshing={isFetchingExecutions}
          onRefresh={hasSchedule ? refreshExecutions : undefined}
        />
      </SettingsCard>
    </div>
  )
}
