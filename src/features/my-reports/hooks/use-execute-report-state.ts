import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { OnChangeFn, PaginationState } from '@tanstack/react-table'
import { saveBlobAsFile } from '@/lib/api-client'
import { useAuth } from '@/features/auth/use-auth'
import { ApiError } from '@/features/auth/auth-types'
import {
  downloadReportExport,
  executeMyReport,
  exportReport,
  getMyReport,
  getMyReportData,
  getMyReportStatus,
  updateMyReportFavorites,
} from '@/features/my-reports/my-report-api'
import type { MyReportListResult } from '@/features/my-reports/my-report-types'
import { REPORT_DATA_PAGE_SIZE_OPTIONS } from '@/features/reports/components/ReportDataTablePagination'
import { formatReportParamDefaults } from '@/features/reports/format-report-param-defaults'
import { useReportJob } from '@/features/reports/hooks/use-report-job'
import type {
  ParametroRelatorio,
  ReportDataResult,
  ReportExecutionParams,
} from '@/features/reports/report-types'
import { queryKeys } from '@/lib/query-keys'

const POLL_INTERVAL_MS = 3000
const DEFAULT_PAGE_SIZE = REPORT_DATA_PAGE_SIZE_OPTIONS[0]

function readFavoriteIdsFromCache(
  queryClient: ReturnType<typeof useQueryClient>,
): number[] {
  const cachedEntries = queryClient.getQueriesData<MyReportListResult>({
    queryKey: ['my-reports', 'list'],
  })

  for (const [, data] of cachedEntries) {
    if (data?.favoriteIds?.length) {
      return data.favoriteIds
    }
  }

  return []
}

function validateExecutionParams(
  parametros: ParametroRelatorio[],
  values: ReportExecutionParams,
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const parametro of parametros) {
    if (!parametro.obrigatorio) {
      continue
    }

    const value = values[parametro.nome]

    if (value === undefined || value === null || value === '') {
      errors[parametro.nome] = 'Campo obrigatório.'
    }
  }

  return errors
}

function isGeneratingSnapshot(
  reportEstado?: string,
  dataEstado?: string,
  statusEstado?: string,
): boolean {
  return (
    reportEstado === 'gerando_snapshot' ||
    dataEstado === 'gerando_snapshot' ||
    statusEstado === 'gerando_snapshot'
  )
}

function stableParamsKey(params: ReportExecutionParams): string {
  return JSON.stringify(params)
}

export function useExecuteReportState(relatorioId: number) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.sub ?? 0

  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() =>
    readFavoriteIdsFromCache(queryClient),
  )
  const [favoriteError, setFavoriteError] = useState<string | null>(null)
  const [togglingFavorite, setTogglingFavorite] = useState(false)
  const [paramValues, setParamValues] = useState<ReportExecutionParams>({})
  const [paramErrors, setParamErrors] = useState<Record<string, string>>({})
  const [onlineData, setOnlineData] = useState<ReportDataResult | null>(null)
  const [hasLoadedData, setHasLoadedData] = useState(false)
  const [executionError, setExecutionError] = useState<string | null>(null)
  const [activeExportJobId, setActiveExportJobId] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const [offlineEnabled, setOfflineEnabled] = useState(false)
  const initializedReportIdRef = useRef<number | null>(null)
  const wasGeneratingRef = useRef(false)

  const reportQuery = useQuery({
    queryKey: queryKeys.myReports.detail(relatorioId),
    queryFn: () => getMyReport(relatorioId),
    enabled: Number.isFinite(relatorioId) && relatorioId > 0,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.statusCode === 403 || error.statusCode === 404)) {
        return false
      }

      return failureCount < 2
    },
  })

  const report = reportQuery.data ?? null
  const parametros = report?.parametros ?? []
  const isOfflineMode = report?.estado === 'offline'
  const paramsKey = useMemo(() => stableParamsKey(paramValues), [paramValues])

  useEffect(() => {
    const cachedFavoriteIds = readFavoriteIdsFromCache(queryClient)

    if (cachedFavoriteIds.length > 0) {
      setFavoriteIds(cachedFavoriteIds)
    }
  }, [queryClient])

  useEffect(() => {
    if (!report || initializedReportIdRef.current === report.id) {
      return
    }

    initializedReportIdRef.current = report.id
    setParamValues(formatReportParamDefaults(parametros))
    setParamErrors({})
    setOnlineData(null)
    setHasLoadedData(false)
    setExecutionError(null)
    setActiveExportJobId(null)
    setExportError(null)
    setPage(1)
    setPageSize(DEFAULT_PAGE_SIZE)
    setOfflineEnabled(false)
  }, [parametros, report])

  const statusQuery = useQuery({
    queryKey: queryKeys.myReports.status(relatorioId),
    queryFn: () => getMyReportStatus(relatorioId),
    enabled: Boolean(report) && isGeneratingSnapshot(report?.estado, onlineData?.estado),
    refetchInterval: (query) =>
      isGeneratingSnapshot(report?.estado, onlineData?.estado, query.state.data?.estado)
        ? POLL_INTERVAL_MS
        : false,
  })

  const offlineQuery = useQuery({
    queryKey: queryKeys.myReports.data(relatorioId, page, pageSize, paramsKey),
    queryFn: () =>
      getMyReportData(relatorioId, {
        page,
        pageSize,
        parametros: paramValues,
      }),
    enabled:
      offlineEnabled &&
      isOfflineMode &&
      Boolean(report) &&
      report?.snapshotValido === true &&
      !isGeneratingSnapshot(report?.estado),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.statusCode === 409 || error.statusCode === 403)) {
        return false
      }

      return failureCount < 2
    },
  })

  useEffect(() => {
    if (offlineQuery.isSuccess && offlineQuery.data) {
      setHasLoadedData(true)
      setExecutionError(null)
    }
  }, [offlineQuery.data, offlineQuery.isSuccess])

  useEffect(() => {
    if (!offlineQuery.isError || !offlineQuery.error) {
      return
    }

    const error = offlineQuery.error
    setExecutionError(
      error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Não foi possível carregar os dados do relatório.',
    )
  }, [offlineQuery.error, offlineQuery.isError])

  const loadData = useCallback(async () => {
    setExecutionError(null)
    setPage(1)
    setOfflineEnabled(true)

    await queryClient.invalidateQueries({
      queryKey: ['my-reports', 'data', relatorioId],
    })
  }, [queryClient, relatorioId])

  useEffect(() => {
    const isGenerating = isGeneratingSnapshot(
      report?.estado,
      onlineData?.estado,
      statusQuery.data?.estado,
    )

    if (wasGeneratingRef.current && !isGenerating) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myReports.detail(relatorioId) })
      void loadData()
    }

    wasGeneratingRef.current = isGenerating
  }, [
    loadData,
    queryClient,
    relatorioId,
    report?.estado,
    onlineData?.estado,
    statusQuery.data?.estado,
  ])

  const exportJobState = useReportJob(activeExportJobId, { scope: 'myReports' })

  const exportMutation = useMutation({
    mutationFn: () => exportReport(relatorioId, paramValues),
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

  const fetchMutation = useMutation({
    mutationFn: async (): Promise<ReportDataResult> => {
      if (report?.estado === 'online') {
        return executeMyReport(relatorioId, paramValues)
      }

      return getMyReportData(relatorioId, {
        page: 1,
        pageSize,
        parametros: paramValues,
      })
    },
    onMutate: () => {
      setExecutionError(null)
      setParamErrors({})
    },
    onSuccess: async (data) => {
      if (report?.estado === 'online') {
        setOnlineData(data)
        setHasLoadedData(true)
        setOfflineEnabled(false)
        await queryClient.invalidateQueries({ queryKey: queryKeys.myReports.detail(relatorioId) })
        await queryClient.invalidateQueries({ queryKey: queryKeys.myReports.status(relatorioId) })
        return
      }

      setPage(1)
      setOfflineEnabled(true)
      setHasLoadedData(true)
      queryClient.setQueryData(
        queryKeys.myReports.data(relatorioId, 1, pageSize, paramsKey),
        data,
      )
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

  const execute = useCallback(() => {
    const errors = validateExecutionParams(parametros, paramValues)

    if (Object.keys(errors).length > 0) {
      setParamErrors(errors)
      return
    }

    void fetchMutation.mutateAsync()
  }, [fetchMutation, paramValues, parametros])

  const onPaginationChange: OnChangeFn<PaginationState> = useCallback((updater) => {
    const current: PaginationState = {
      pageIndex: page - 1,
      pageSize,
    }
    const next = typeof updater === 'function' ? updater(current) : updater
    setPage(next.pageIndex + 1)
    setPageSize(next.pageSize)
  }, [page, pageSize])

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

  const isFavorite = favoriteIds.includes(relatorioId)

  const favoriteMutation = useMutation({
    mutationFn: (nextFavoriteIds: number[]) => {
      if (!userId) {
        throw new Error('Usuário não autenticado.')
      }

      return updateMyReportFavorites(userId, nextFavoriteIds)
    },
    onMutate: async (nextFavoriteIds) => {
      setFavoriteError(null)
      const previousFavoriteIds = favoriteIds
      setFavoriteIds(nextFavoriteIds)
      return { previousFavoriteIds }
    },
    onError: (error, _nextFavoriteIds, context) => {
      if (context?.previousFavoriteIds) {
        setFavoriteIds(context.previousFavoriteIds)
      }

      setFavoriteError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Não foi possível atualizar os favoritos.',
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-reports', 'list'] })
    },
    onSettled: () => {
      setTogglingFavorite(false)
    },
  })

  const toggleFavorite = useCallback(() => {
    if (!userId || favoriteMutation.isPending) {
      return
    }

    setTogglingFavorite(true)
    const nextFavoriteIds = isFavorite
      ? favoriteIds.filter((id) => id !== relatorioId)
      : [...favoriteIds, relatorioId]

    void favoriteMutation.mutateAsync(nextFavoriteIds)
  }, [favoriteIds, favoriteMutation, isFavorite, relatorioId, userId])

  const openInfoDrawer = useCallback(() => {
    setIsInfoDrawerOpen(true)
  }, [])

  const closeInfoDrawer = useCallback(() => {
    setIsInfoDrawerOpen(false)
  }, [])

  const toggleInfoDrawer = useCallback(() => {
    setIsInfoDrawerOpen((current) => !current)
  }, [])

  const isGenerating = isGeneratingSnapshot(
    report?.estado,
    onlineData?.estado,
    statusQuery.data?.estado,
  )

  const reportData = isOfflineMode ? (offlineQuery.data ?? null) : onlineData
  const currentEstado = reportData?.estado ?? report?.estado
  const isLoadingData =
    fetchMutation.isPending ||
    (isOfflineMode && offlineEnabled && offlineQuery.isLoading && !offlineQuery.data)
  const isFetchingPage = isOfflineMode && offlineQuery.isFetching && !offlineQuery.isLoading

  const totalLinhas = reportData?.totalLinhas ?? 0
  const pageCount = Math.max(1, Math.ceil(totalLinhas / pageSize) || 1)

  const snapshotInvalid =
    report?.estado === 'offline' && report.snapshotValido === false

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
    report,
    isLoading: reportQuery.isLoading,
    isError: reportQuery.isError,
    error: reportQuery.error,
    paramValues,
    setParamValues,
    paramErrors,
    reportData,
    hasLoadedData,
    isLoadingData,
    isFetchingPage,
    isExecuting: fetchMutation.isPending,
    executionError,
    execute,
    loadData,
    isGenerating,
    status: statusQuery.data ?? null,
    isInfoDrawerOpen,
    openInfoDrawer,
    closeInfoDrawer,
    toggleInfoDrawer,
    isFavorite,
    toggleFavorite,
    isTogglingFavorite: togglingFavorite,
    favoriteError,
    currentEstado,
    exportCsv,
    downloadExport,
    isExporting,
    isDownloading,
    exportError,
    exportJob,
    paginationMode: (isOfflineMode ? 'server' : 'client') as 'server' | 'client',
    pageIndex: page - 1,
    pageSize,
    pageCount,
    onPaginationChange,
    snapshotInvalid,
  }
}
