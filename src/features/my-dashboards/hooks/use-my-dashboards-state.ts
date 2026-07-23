import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/use-auth'
import { ApiError } from '@/features/auth/auth-types'
import {
  listMyDashboards,
  updateMyDashboardFavorites,
} from '@/features/my-dashboards/my-dashboard-api'
import {
  buildMyDashboardListParams,
  DEFAULT_MY_DASHBOARD_FILTERS,
  MY_DASHBOARDS_PAGE_SIZE,
} from '@/features/my-dashboards/my-dashboard-filters'
import type { MyDashboardFilters, MyDashboardViewMode } from '@/features/my-dashboards/my-dashboard-types'
import { queryKeys } from '@/lib/query-keys'

const VIEW_MODE_STORAGE_KEY = 'datadash.my-dashboards.viewMode'

function readStoredViewMode(): MyDashboardViewMode {
  if (typeof window === 'undefined') {
    return 'grid'
  }

  const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
  return stored === 'table' ? 'table' : 'grid'
}

export function useMyDashboardsState() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.sub ?? 0

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<MyDashboardFilters>(DEFAULT_MY_DASHBOARD_FILTERS)
  const [draftFilters, setDraftFilters] = useState<MyDashboardFilters>(DEFAULT_MY_DASHBOARD_FILTERS)
  const [viewMode, setViewModeState] = useState<MyDashboardViewMode>(readStoredViewMode)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(MY_DASHBOARDS_PAGE_SIZE)
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
  const [favoriteError, setFavoriteError] = useState<string | null>(null)
  const [togglingFavoriteId, setTogglingFavoriteId] = useState<number | null>(null)

  const listParams = useMemo(
    () => buildMyDashboardListParams(search, filters, page, pageSize),
    [filters, page, pageSize, search],
  )

  const dashboardsQuery = useQuery({
    queryKey: queryKeys.myDashboards.list(listParams),
    queryFn: () => listMyDashboards(listParams),
    enabled: userId > 0,
  })

  useEffect(() => {
    if (dashboardsQuery.data?.favoriteIds) {
      setFavoriteIds(dashboardsQuery.data.favoriteIds)
    }
  }, [dashboardsQuery.data?.favoriteIds])

  const dashboards = dashboardsQuery.data?.items ?? []
  const totalCount = dashboardsQuery.data?.totalCount ?? 0
  const filteredCount = dashboards.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const showPagination = totalCount > pageSize

  const setViewMode = useCallback((mode: MyDashboardViewMode) => {
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

  const applyFilters = useCallback((nextFilters: MyDashboardFilters) => {
    setFilters(nextFilters)
    setDraftFilters(nextFilters)
    setFilterDialogOpen(false)
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setSearch('')
    setFilters(DEFAULT_MY_DASHBOARD_FILTERS)
    setDraftFilters(DEFAULT_MY_DASHBOARD_FILTERS)
    setPage(1)
  }, [])

  const toggleFavoritesFilter = useCallback(() => {
    setFilters((current: MyDashboardFilters) => {
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
    await dashboardsQuery.refetch()
  }, [dashboardsQuery])

  const favoriteMutation = useMutation({
    mutationFn: (nextFavoriteIds: number[]) => {
      if (!userId) {
        throw new Error('Usuário não autenticado.')
      }

      return updateMyDashboardFavorites(userId, nextFavoriteIds)
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
      await queryClient.invalidateQueries({ queryKey: ['my-dashboards', 'list'] })
    },
    onSettled: () => {
      setTogglingFavoriteId(null)
    },
  })

  const isFavorite = useCallback(
    (dashboardId: number) => favoriteIds.includes(dashboardId),
    [favoriteIds],
  )

  const toggleFavorite = useCallback(
    (dashboardId: number) => {
      if (!userId || favoriteMutation.isPending) {
        return
      }

      setTogglingFavoriteId(dashboardId)
      const nextFavoriteIds = isFavorite(dashboardId)
        ? favoriteIds.filter((id) => id !== dashboardId)
        : [...favoriteIds, dashboardId]

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

  const openDashboard = useCallback(
    (dashboardId: number) => {
      void navigate({
        to: '/dashboards/$dashboardId/visualizar',
        params: { dashboardId: String(dashboardId) },
      })
    },
    [navigate],
  )

  return {
    dashboards,
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
    isLoading: dashboardsQuery.isLoading,
    isFetching: dashboardsQuery.isFetching,
    isError: dashboardsQuery.isError,
    error: dashboardsQuery.error,
    isRefreshing: dashboardsQuery.isFetching && !dashboardsQuery.isLoading,
    refresh,
    filterDialogOpen,
    openFilterDialog,
    closeFilterDialog,
    isFavorite,
    toggleFavorite,
    togglingFavoriteId,
    favoriteError,
    openDashboard,
  }
}
