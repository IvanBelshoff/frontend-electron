import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useMemo, useState } from 'react'
import { hasPermission } from '@/features/auth/rbac'
import { DASHBOARD_RBAC } from '@/features/auth/rbac-requirements'
import { useRbac } from '@/features/auth/use-rbac'
import { listDashboards } from '@/features/dashboards/dashboard-api'
import {
  applyDashboardFilters,
  DEFAULT_DASHBOARD_FILTERS,
} from '@/features/dashboards/dashboard-filters'
import type {
  Dashboard,
  DashboardFilters,
  DashboardViewMode,
} from '@/features/dashboards/dashboard-types'
import { queryKeys } from '@/lib/query-keys'

const VIEW_MODE_STORAGE_KEY = 'datadash.dashboards.viewMode'
const DASHBOARDS_FETCH_LIMIT = 100

function readStoredViewMode(): DashboardViewMode {
  if (typeof window === 'undefined') {
    return 'grid'
  }

  const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
  return stored === 'table' ? 'table' : 'grid'
}

export function useDashboardListState() {
  const navigate = useNavigate()
  const rbac = useRbac()
  const canCreate = hasPermission(rbac, DASHBOARD_RBAC.create)
  const canEdit = hasPermission(rbac, DASHBOARD_RBAC.update)
  const canDelete = hasPermission(rbac, DASHBOARD_RBAC.delete)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_DASHBOARD_FILTERS)
  const [draftFilters, setDraftFilters] = useState<DashboardFilters>(DEFAULT_DASHBOARD_FILTERS)
  const [viewMode, setViewModeState] = useState<DashboardViewMode>(readStoredViewMode)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)

  const dashboardsQuery = useQuery({
    queryKey: queryKeys.dashboard.list({ limit: DASHBOARDS_FETCH_LIMIT }),
    queryFn: () => listDashboards({ page: 1, limit: DASHBOARDS_FETCH_LIMIT }),
  })

  const dashboards = dashboardsQuery.data?.items ?? []
  const totalCount = dashboardsQuery.data?.totalCount ?? 0

  const filteredDashboards = useMemo(
    () => applyDashboardFilters(dashboards, search, filters),
    [dashboards, search, filters],
  )

  const filteredCount = filteredDashboards.length

  const setViewMode = useCallback((mode: DashboardViewMode) => {
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

  const applyFilters = useCallback((nextFilters: DashboardFilters) => {
    setFilters(nextFilters)
    setDraftFilters(nextFilters)
    setFilterDialogOpen(false)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_DASHBOARD_FILTERS)
    setDraftFilters(DEFAULT_DASHBOARD_FILTERS)
  }, [])

  const refresh = useCallback(async () => {
    await dashboardsQuery.refetch()
  }, [dashboardsQuery])

  const handleCreate = useCallback(() => {
    if (!canCreate) return
    void navigate({ to: '/dashboards/novo' })
  }, [canCreate, navigate])

  const handleEdit = useCallback(
    (dashboard: Dashboard) => {
      if (!canEdit) return
      void navigate({
        to: '/dashboards/$dashboardId/editar',
        params: { dashboardId: String(dashboard.id) },
      })
    },
    [canEdit, navigate],
  )

  return {
    dashboards,
    filteredDashboards,
    totalCount,
    filteredCount,
    canCreate,
    canEdit,
    canDelete,
    search,
    setSearch,
    filters,
    draftFilters,
    setDraftFilters,
    applyFilters,
    clearFilters,
    viewMode,
    setViewMode,
    isLoading: dashboardsQuery.isLoading,
    isError: dashboardsQuery.isError,
    error: dashboardsQuery.error,
    isRefreshing: dashboardsQuery.isFetching && !dashboardsQuery.isLoading,
    refresh,
    filterDialogOpen,
    openFilterDialog,
    closeFilterDialog,
    handleCreate,
    handleEdit,
  }
}
