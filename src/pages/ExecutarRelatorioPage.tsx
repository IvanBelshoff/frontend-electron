import { Link, useParams } from '@tanstack/react-router'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import { ApiError } from '@/features/auth/auth-types'
import MyReportInfoDrawer from '@/features/my-reports/components/MyReportInfoDrawer'
import MyReportViewerHeader from '@/features/my-reports/components/MyReportViewerHeader'
import { useExecuteReportState } from '@/features/my-reports/hooks/use-execute-report-state'
import ReportDataTable from '@/features/reports/components/ReportDataTable'
import ReportExportControls from '@/features/reports/components/ReportExportControls'
import ReportParamForm from '@/features/reports/components/ReportParamForm'
import ReportStatusBadges from '@/features/reports/components/ReportStatusBadges'

export default function ExecutarRelatorioPage() {
  const { relatorioId: relatorioIdParam } = useParams({ strict: false })
  const relatorioId = Number(relatorioIdParam)

  const {
    report,
    isLoading,
    isError,
    error,
    paramValues,
    setParamValues,
    paramErrors,
    reportData,
    hasLoadedData,
    isLoadingData,
    isFetchingPage,
    isExecuting,
    executionError,
    execute,
    isGenerating,
    isInfoDrawerOpen,
    closeInfoDrawer,
    toggleInfoDrawer,
    isFavorite,
    toggleFavorite,
    isTogglingFavorite,
    favoriteError,
    currentEstado,
    exportCsv,
    downloadExport,
    isExporting,
    isDownloading,
    exportError,
    exportJob,
    paginationMode,
    pageIndex,
    pageSize,
    pageCount,
    onPaginationChange,
    snapshotInvalid,
  } = useExecuteReportState(relatorioId)

  if (!Number.isFinite(relatorioId) || relatorioId <= 0) {
    return (
      <div className="space-y-4">
        <Alert variant="error">Identificador de relatório inválido.</Alert>
        <Link to="/relatorios" className="text-sm text-vscode-accent hover:underline">
          Voltar para Meus Relatórios
        </Link>
      </div>
    )
  }

  const isForbidden = error instanceof ApiError && error.statusCode === 403
  const isNotFound = error instanceof ApiError && error.statusCode === 404

  const errorMessage = isForbidden
    ? 'Você não tem acesso a este relatório.'
    : isNotFound
      ? 'Relatório não encontrado.'
      : error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Não foi possível carregar o relatório.'

  const showInitialLoading = (isLoadingData || isGenerating) && !reportData

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-vscode-border/60" />
            <div className="h-6 w-48 animate-pulse rounded bg-vscode-border/60" />
          </div>
        ) : report ? (
          <MyReportViewerHeader
            reportName={report.nome}
            reportIcon={report.icone}
            isFavorite={isFavorite}
            isTogglingFavorite={isTogglingFavorite}
            isInfoDrawerOpen={isInfoDrawerOpen}
            onToggleFavorite={toggleFavorite}
            onToggleInfoDrawer={toggleInfoDrawer}
          />
        ) : null}

        {favoriteError && <Alert variant="error">{favoriteError}</Alert>}
        {executionError && <Alert variant="error">{executionError}</Alert>}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center rounded-lg border border-vscode-border bg-vscode-sidebar px-6 py-16 text-sm text-vscode-text-muted">
            Carregando relatório...
          </div>
        ) : isError || !report ? (
          <div className="space-y-4">
            <Alert variant="error">{errorMessage}</Alert>
            <Link to="/relatorios" className="text-sm text-vscode-accent hover:underline">
              Voltar para Meus Relatórios
            </Link>
          </div>
        ) : (
          <>
            <section className="space-y-4 rounded-xl border border-vscode-border bg-vscode-sidebar/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-vscode-text">Parâmetros</h2>
                  {currentEstado && (
                    <ReportStatusBadges report={{ ...report, estado: currentEstado }} field="estado" />
                  )}
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={execute}
                  loading={isExecuting}
                  disabled={isGenerating || snapshotInvalid}
                >
                  Executar relatório
                </Button>
              </div>

              <ReportParamForm
                parametros={report.parametros ?? []}
                values={paramValues}
                onChange={setParamValues}
                errors={paramErrors}
                disabled={isExecuting || isGenerating}
              />

              {snapshotInvalid && (
                <Alert variant="info">
                  Snapshot desatualizado — solicite ao gestor uma nova geração. Relatórios offline
                  em formato antigo precisam ser regenerados antes da visualização.
                </Alert>
              )}

              {isGenerating && (
                <p className="text-sm text-vscode-text-muted">
                  Snapshot em geração. Os dados serão atualizados automaticamente quando a
                  geração for concluída.
                </p>
              )}
            </section>

            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-vscode-text">Resultados</h2>
                {reportData && (
                  <span className="text-xs text-vscode-text-muted">
                    {reportData.totalLinhas} linha(s)
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
                disabled={isGenerating || snapshotInvalid}
              />

              {showInitialLoading ? (
                <div className="flex items-center justify-center rounded-lg border border-vscode-border bg-vscode-sidebar px-6 py-16 text-sm text-vscode-text-muted">
                  {isGenerating ? 'Gerando snapshot...' : 'Carregando dados...'}
                </div>
              ) : snapshotInvalid && !hasLoadedData ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-vscode-border bg-vscode-sidebar/50 px-6 py-16 text-center">
                  <h3 className="text-base font-semibold text-vscode-text">
                    Snapshot desatualizado
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-vscode-text-muted">
                    Solicite ao gestor uma nova geração do snapshot para visualizar os dados.
                  </p>
                </div>
              ) : (
                <ReportDataTable
                  colunas={reportData?.colunas ?? []}
                  dados={reportData?.dados ?? []}
                  hasLoaded={hasLoadedData}
                  totalLinhas={reportData?.totalLinhas}
                  paginationMode={paginationMode}
                  pageIndex={pageIndex}
                  pageSize={pageSize}
                  pageCount={pageCount}
                  onPaginationChange={onPaginationChange}
                  isFetching={isFetchingPage}
                />
              )}
            </section>
          </>
        )}
      </div>

      <MyReportInfoDrawer
        isOpen={isInfoDrawerOpen}
        report={report}
        onClose={closeInfoDrawer}
      />
    </div>
  )
}
