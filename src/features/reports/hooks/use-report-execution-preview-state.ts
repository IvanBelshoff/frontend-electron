import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatReportParamDefaults } from '@/features/reports/format-report-param-defaults'
import {
  executeReport,
  getReportData,
  getReportStatus,
  refreshReportSnapshot,
} from '@/features/reports/report-api'
import type { Report, ReportDataResult, ReportExecutionParams } from '@/features/reports/report-types'
import { ApiError } from '@/features/auth/auth-types'
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.report.status(reportId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.report.detail(reportId) })
    },
  })

  const runPreview = useCallback(async () => {
    await loadDataMutation.mutateAsync(parametros)
  }, [loadDataMutation, parametros])

  const refreshSnapshot = useCallback(async () => {
    await snapshotMutation.mutateAsync(parametros)
  }, [parametros, snapshotMutation])

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
  }
}
