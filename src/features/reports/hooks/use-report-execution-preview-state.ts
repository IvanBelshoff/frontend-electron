import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { saveBlobAsFile } from '@/lib/api-client'
import { ApiError } from '@/features/auth/auth-types'
import { formatReportParamDefaults } from '@/features/reports/format-report-param-defaults'
import { useReportJob } from '@/features/reports/hooks/use-report-job'
import {
  downloadReportExport,
  executeReport,
  exportReport,
  getReportData,
  getReportStatus,
  refreshReportSnapshot,
} from '@/features/reports/report-api'
import type { Report, ReportDataResult, ReportExecutionParams } from '@/features/reports/report-types'
import { queryKeys } from '@/lib/query-keys'

const STATUS_POLL_MS = 3000

export function useReportExecutionPreviewState(
  reportId: number,
  report: Report | undefined,
  enabled: boolean,
) {
  const queryClient = useQueryClient()
  const [parametros, setParametros] = useState<ReportExecutionParams>({})
  const [dataResult, setDataResult] = useState<ReportDataResult | null>(null)
  const [hasLoadedData, setHasLoadedData] = useState(false)
  const [executionError, setExecutionError] = useState<string | null>(null)
  const [activeExportJobId, setActiveExportJobId] = useState<string | null>(null)
  const [activeSnapshotJobId, setActiveSnapshotJobId] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (!report?.parametros) {
      setParametros({})
      return
    }

    setParametros(formatReportParamDefaults(report.parametros))
  }, [report?.id, report?.parametros])

  useEffect(() => {
    setDataResult(null)
    setHasLoadedData(false)
    setExecutionError(null)
    setActiveExportJobId(null)
    setActiveSnapshotJobId(null)
    setExportError(null)
  }, [reportId])

  const statusQuery = useQuery({
    queryKey: queryKeys.report.status(reportId),
    queryFn: () => getReportStatus(reportId),
    enabled: enabled && Number.isFinite(reportId) && reportId > 0,
    refetchInterval: (query) =>
      query.state.data?.estado === 'gerando_snapshot' ? STATUS_POLL_MS : false,
  })

  const status = statusQuery.data
  const isGeneratingSnapshot = status?.estado === 'gerando_snapshot'

  const handleSnapshotJobCompleted = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.report.status(reportId) })
    void queryClient.invalidateQueries({ queryKey: queryKeys.report.detail(reportId) })
  }, [queryClient, reportId])

  const exportJobState = useReportJob(activeExportJobId, { scope: 'report' })
  const snapshotJobState = useReportJob(activeSnapshotJobId, {
    scope: 'report',
    onCompleted: handleSnapshotJobCompleted,
  })

  const loadDataMutation = useMutation({
    mutationFn: async (params: ReportExecutionParams) => {
      if (report?.estado === 'online') {
        return executeReport(reportId, params)
      }

      return getReportData(reportId, params)
    },
    onSuccess: (result) => {
      setDataResult(result)
      setHasLoadedData(true)
      setExecutionError(null)
    },
    onError: (error) => {
      setExecutionError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Não foi possível executar o relatório.',
      )
    },
  })

  const snapshotMutation = useMutation({
    mutationFn: (params: ReportExecutionParams) =>
      refreshReportSnapshot(reportId, params),
    onSuccess: async (result) => {
      setActiveSnapshotJobId(result.jobId)
      await queryClient.invalidateQueries({ queryKey: queryKeys.report.status(reportId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.report.detail(reportId) })
    },
  })

  const exportMutation = useMutation({
    mutationFn: () => exportReport(reportId, parametros),
    onMutate: () => {
      setExportError(null)
    },
    onSuccess: (result) => {
      setActiveExportJobId(result.jobId)
    },
    onError: (error) => {
      setExportError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Não foi possível enfileirar a exportação.',
      )
    },
  })

  const runPreview = useCallback(async () => {
    await loadDataMutation.mutateAsync(parametros)
  }, [loadDataMutation, parametros])

  const refreshSnapshot = useCallback(async () => {
    await snapshotMutation.mutateAsync(parametros)
  }, [parametros, snapshotMutation])

  const exportCsv = useCallback(() => {
    void exportMutation.mutateAsync()
  }, [exportMutation])

  const downloadExport = useCallback(async () => {
    if (!activeExportJobId) {
      return
    }

    setIsDownloading(true)
    setExportError(null)

    try {
      const { blob, filename } = await downloadReportExport(activeExportJobId)
      saveBlobAsFile(blob, filename)
    } catch (error) {
      setExportError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Não foi possível baixar o arquivo exportado.',
      )
    } finally {
      setIsDownloading(false)
    }
  }, [activeExportJobId])

  const updateParametro = useCallback((nome: string, value: unknown) => {
    setParametros((current) => ({ ...current, [nome]: value }))
  }, [])

  const setAllParametros = useCallback((values: Record<string, unknown>) => {
    setParametros(values)
  }, [])

  const canExecute = useMemo(() => {
    if (!report) {
      return false
    }

    if (report.estado === 'online') {
      return true
    }

    return report.estado === 'offline' && report.snapshotValido
  }, [report])

  const exportJob = useMemo(() => {
    if (!exportJobState.job) {
      return null
    }

    return {
      jobId: exportJobState.job.jobId,
      tipo: exportJobState.job.tipo,
      status: exportJobState.job.status,
      progress: exportJobState.job.progress,
      relatorioId: exportJobState.job.relatorioId,
      errorMessage: exportJobState.job.errorMessage,
      downloadAvailable: exportJobState.job.downloadAvailable,
      createdAt: exportJobState.job.createdAt,
      completedAt: exportJobState.job.completedAt,
    }
  }, [exportJobState.job])

  const isExporting =
    exportMutation.isPending ||
    exportJobState.status === 'queued' ||
    exportJobState.status === 'processing'

  return {
    parametros,
    setParametros: setAllParametros,
    updateParametro,
    dataResult,
    hasLoadedData,
    executionError,
    status,
    isGeneratingSnapshot,
    isLoadingStatus: statusQuery.isLoading,
    isExecuting: loadDataMutation.isPending,
    isRefreshingSnapshot: snapshotMutation.isPending,
    canExecute,
    runPreview,
    refreshSnapshot,
    exportCsv,
    downloadExport,
    isExporting,
    isDownloading,
    exportError,
    exportJob,
    snapshotJobProgress: snapshotJobState.job ? snapshotJobState.progress : null,
    snapshotJobStatus: snapshotJobState.job?.status ?? null,
  }
}
