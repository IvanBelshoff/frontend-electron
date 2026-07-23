import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/use-auth'
import { ApiError } from '@/features/auth/auth-types'
import {
  listMyReports,
  updateMyReportFavorites,
} from '@/features/my-reports/my-report-api'
import {
  buildMyReportListParams,
  DEFAULT_MY_REPORT_FILTERS,
  MY_REPORTS_PAGE_SIZE,
} from '@/features/my-reports/my-report-filters'
import type { MyReportFilters, MyReportViewMode } from '@/features/my-reports/my-report-types'
import { queryKeys } from '@/lib/query-keys'

const VIEW_MODE_STORAGE_KEY = 'datadash.my-reports.viewMode'

function readStoredViewMode(): MyReportViewMode {
  if (typeof window === 'undefined') {
    return 'grid'
  }

  const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
  return stored === 'table' ? 'table' : 'grid'
}

export function useMyReportsState() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.sub ?? 0

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<MyReportFilters>(DEFAULT_MY_REPORT_FILTERS)
  const [draftFilters, setDraftFilters] = useState<MyReportFilters>(DEFAULT_MY_REPORT_FILTERS)
  const [viewMode, setViewModeState] = useState<MyReportViewMode>(readStoredViewMode)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(MY_REPORTS_PAGE_SIZE)
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
  const [favoriteError, setFavoriteError] = useState<string | null>(null)
  const [togglingFavoriteId, setTogglingFavoriteId] = useState<number | null>(null)

  const listParams = useMemo(
    () => buildMyReportListParams(search, filters, page, pageSize),
    [filters, page, pageSize, search],
  )

  const reportsQuery = useQuery({
    queryKey: queryKeys.myReports.list(listParams),
    queryFn: () => listMyReports(listParams),
    enabled: userId > 0,
  })

  useEffect(() => {
    if (reportsQuery.data?.favoriteIds) {
      setFavoriteIds(reportsQuery.data.favoriteIds)
    }
  }, [reportsQuery.data?.favoriteIds])

  const reports = reportsQuery.data?.items ?? []
  const totalCount = reportsQuery.data?.totalCount ?? 0
  const filteredCount = reports.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const showPagination = totalCount > pageSize

  const setViewMode = useCallback((mode: MyReportViewMode) => {
    setViewModeState(mode)
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode)
  }, [])

  const openFilterDialog = useCallback(() => {
    setDraftFilters(filters)
    setFilterDialogOpen(true)
  }, [filters])

  const closeFilterDialog = useCallback(() => {
    setFilterDialogOpen(false)
  }, [])

  const applyFilters = useCallback((nextFilters: MyReportFilters) => {
    setFilters(nextFilters)
    setDraftFilters(nextFilters)
    setFilterDialogOpen(false)
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setSearch('')
    setFilters(DEFAULT_MY_REPORT_FILTERS)
    setDraftFilters(DEFAULT_MY_REPORT_FILTERS)
    setPage(1)
  }, [])

  const toggleFavoritesFilter = useCallback(() => {
    setFilters((current: MyReportFilters) => {
      const next = { ...current, favoritos: !current.favoritos }
      setDraftFilters(next)
      return next
    })
    setPage(1)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const refresh = useCallback(async () => {
    await reportsQuery.refetch()
  }, [reportsQuery])

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
      setTogglingFavoriteId(null)
    },
  })

  const isFavorite = useCallback(
    (reportId: number) => favoriteIds.includes(reportId),
    [favoriteIds],
  )

  const toggleFavorite = useCallback(
    (reportId: number) => {
      if (!userId || favoriteMutation.isPending) {
        return
      }

      setTogglingFavoriteId(reportId)
      const nextFavoriteIds = isFavorite(reportId)
        ? favoriteIds.filter((id) => id !== reportId)
        : [...favoriteIds, reportId]

      void favoriteMutation.mutateAsync(nextFavoriteIds)
    },
    [favoriteIds, favoriteMutation, isFavorite, userId],
  )

  const goToPreviousPage = useCallback(() => {
    setPage((current) => Math.max(1, current - 1))
  }, [])

  const goToNextPage = useCallback(() => {
    setPage((current) => Math.min(totalPages, current + 1))
  }, [totalPages])

  const goToPage = useCallback((nextPage: number) => {
    setPage(nextPage)
  }, [])

  const handlePageSizeChange = useCallback((nextPageSize: number) => {
    setPageSize(nextPageSize)
    setPage(1)
  }, [])

  const openReport = useCallback(
    (relatorioId: number) => {
      void navigate({
        to: '/relatorios/$relatorioId/executar',
        params: { relatorioId: String(relatorioId) },
      })
    },
    [navigate],
  )

  return {
    reports,
    totalCount,
    filteredCount,
    search,
    setSearch: handleSearchChange,
    filters,
    draftFilters,
    setDraftFilters,
    applyFilters,
    clearFilters,
    toggleFavoritesFilter,
    viewMode,
    setViewMode,
    page,
    pageSize,
    totalPages,
    showPagination,
    goToPreviousPage,
    goToNextPage,
    goToPage,
    onPageSizeChange: handlePageSizeChange,
    isLoading: reportsQuery.isLoading,
    isFetching: reportsQuery.isFetching,
    isError: reportsQuery.isError,
    error: reportsQuery.error,
    isRefreshing: reportsQuery.isFetching && !reportsQuery.isLoading,
    refresh,
    filterDialogOpen,
    openFilterDialog,
    closeFilterDialog,
    isFavorite,
    toggleFavorite,
    togglingFavoriteId,
    favoriteError,
    openReport,
  }
}
