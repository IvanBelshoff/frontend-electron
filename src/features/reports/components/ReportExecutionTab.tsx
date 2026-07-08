import SettingsCard from '@/components/settings/SettingsCard'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import ReportDataTable from '@/features/reports/components/ReportDataTable'
import ReportExportControls from '@/features/reports/components/ReportExportControls'
import ReportParamForm from '@/features/reports/components/ReportParamForm'
import ReportSnapshotControls from '@/features/reports/components/ReportSnapshotControls'
import ReportStatusBadges from '@/features/reports/components/ReportStatusBadges'
import { useReportExecutionPreviewState } from '@/features/reports/hooks/use-report-execution-preview-state'
import type { Report } from '@/features/reports/report-types'

type ReportExecutionTabProps = {
  reportId: number
  report: Report
  enabled: boolean
}

export default function ReportExecutionTab({
  reportId,
  report,
  enabled,
}: ReportExecutionTabProps) {
  const {
    parametros,
    setParametros,
    dataResult,
    hasLoadedData,
    executionError,
    status,
    isGeneratingSnapshot,
    isExecuting,
    isRefreshingSnapshot,
    canExecute,
    runPreview,
    refreshSnapshot,
    exportCsv,
    downloadExport,
    isExporting,
    isDownloading,
    exportError,
    exportJob,
    snapshotJobProgress,
    snapshotJobStatus,
  } = useReportExecutionPreviewState(reportId, report, enabled)

  const displayStatus = status ?? {
    estado: report.estado,
    snapshotValido: report.snapshotValido,
    snapshotAtualizadoEm: report.snapshotAtualizadoEm,
    erroUltimaGeracao: report.erroUltimaGeracao,
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <SettingsCard className="shrink-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-vscode-text">Preview de execução</h3>
            <p className="mt-1 text-xs text-vscode-text-muted">
              Teste parâmetros e visualize os dados retornados pelo relatório.
            </p>
          </div>
          <ReportStatusBadges
            report={{
              ...report,
              estado: displayStatus.estado,
            }}
            field="estado"
          />
        </div>

        <div className="mt-4 space-y-4">
          <ReportParamForm
            parametros={report.parametros ?? []}
            values={parametros}
            onChange={setParametros}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              loading={isExecuting}
              disabled={!canExecute || isGeneratingSnapshot}
              onClick={() => void runPreview()}
            >
              Executar preview
            </Button>
          </div>

          {executionError && <Alert variant="error">{executionError}</Alert>}

          {report.erroUltimaGeracao && (
            <Alert variant="info">
              Última geração de snapshot falhou: {report.erroUltimaGeracao}
            </Alert>
          )}
        </div>
      </SettingsCard>

      <div className="shrink-0">
        <ReportSnapshotControls
          estado={displayStatus.estado}
          snapshotValido={displayStatus.snapshotValido}
          snapshotAtualizadoEm={displayStatus.snapshotAtualizadoEm}
          isRefreshing={isRefreshingSnapshot}
          snapshotJobProgress={snapshotJobProgress}
          snapshotJobStatus={snapshotJobStatus}
          onRefresh={() => void refreshSnapshot()}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="shrink-0 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-vscode-text">Resultados</h3>
            {dataResult && (
              <span className="text-xs text-vscode-text-muted">
                {dataResult.totalLinhas} linha(s)
              </span>
            )}
          </div>

          <ReportExportControls
            onExport={exportCsv}
            onDownload={() => void downloadExport()}
            isExporting={isExporting}
            isDownloading={isDownloading}
            activeJob={exportJob}
            exportError={exportError}
            disabled={isGeneratingSnapshot}
          />
        </div>

        <div className="min-h-0 flex-1">
          {isExecuting || isGeneratingSnapshot ? (
            <div className="flex h-full min-h-[320px] items-center justify-center rounded-lg border border-vscode-border bg-vscode-sidebar px-6 py-16 text-sm text-vscode-text-muted">
              {isGeneratingSnapshot ? 'Gerando snapshot...' : 'Carregando dados...'}
            </div>
          ) : (
            <ReportDataTable
              className="h-full min-h-0"
              colunas={dataResult?.colunas ?? []}
              dados={dataResult?.dados ?? []}
              hasLoaded={hasLoadedData}
              totalLinhas={dataResult?.totalLinhas}
            />
          )}
        </div>
      </div>
    </div>
  )
}
