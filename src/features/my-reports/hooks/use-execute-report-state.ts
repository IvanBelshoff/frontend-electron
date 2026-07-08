import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/features/auth/use-auth'
import { ApiError } from '@/features/auth/auth-types'
import {
  executeMyReport,
  getMyReport,
  getMyReportData,
  getMyReportStatus,
  updateMyReportFavorites,
} from '@/features/my-reports/my-report-api'
import type { MyReportListResult } from '@/features/my-reports/my-report-types'
import { formatReportParamDefaults } from '@/features/reports/format-report-param-defaults'
import type {
  ParametroRelatorio,
  ReportDataResult,
  ReportExecutionParams,
} from '@/features/reports/report-types'
import { queryKeys } from '@/lib/query-keys'

const POLL_INTERVAL_MS = 3000

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
  const [reportData, setReportData] = useState<ReportDataResult | null>(null)
  const [executionError, setExecutionError] = useState<string | null>(null)
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
    setReportData(null)
    setExecutionError(null)
  }, [parametros, report])

  const statusQuery = useQuery({
    queryKey: queryKeys.myReports.status(relatorioId),
    queryFn: () => getMyReportStatus(relatorioId),
    enabled: Boolean(report) && isGeneratingSnapshot(report?.estado, reportData?.estado),
    refetchInterval: (query) =>
      isGeneratingSnapshot(report?.estado, reportData?.estado, query.state.data?.estado)
        ? POLL_INTERVAL_MS
        : false,
  })

  const loadData = useCallback(async () => {
    setExecutionError(null)

    try {
      const data = await getMyReportData(relatorioId, paramValues)
      setReportData(data)
    } catch (error) {
      setExecutionError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Não foi possível carregar os dados do relatório.',
      )
    }
  }, [paramValues, relatorioId])

  useEffect(() => {
    const isGenerating = isGeneratingSnapshot(
      report?.estado,
      reportData?.estado,
      statusQuery.data?.estado,
    )

    if (wasGeneratingRef.current && !isGenerating) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myReports.detail(relatorioId) })
      void loadData()
    }

    wasGeneratingRef.current = isGenerating
  }, [loadData, queryClient, relatorioId, report?.estado, reportData?.estado, statusQuery.data?.estado])

  useEffect(() => {
    if (!report || initializedReportIdRef.current !== report.id) {
      return
    }

    if (report.estado === 'online' || (report.estado === 'offline' && report.snapshotValido)) {
      void loadData()
    }
  }, [loadData, report])

  const executeMutation = useMutation({
    mutationFn: () => executeMyReport(relatorioId, paramValues),
    onMutate: () => {
      setExecutionError(null)
      setParamErrors({})
    },
    onSuccess: async (data) => {
      setReportData(data)
      await queryClient.invalidateQueries({ queryKey: queryKeys.myReports.detail(relatorioId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.myReports.status(relatorioId) })
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

    void executeMutation.mutateAsync()
  }, [executeMutation, paramValues, parametros])

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
    reportData?.estado,
    statusQuery.data?.estado,
  )

  const currentEstado = reportData?.estado ?? report?.estado

  return {
    report,
    isLoading: reportQuery.isLoading,
    isError: reportQuery.isError,
    error: reportQuery.error,
    paramValues,
    setParamValues,
    paramErrors,
    reportData,
    isLoadingData: executeMutation.isPending,
    isExecuting: executeMutation.isPending,
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
  }
}
