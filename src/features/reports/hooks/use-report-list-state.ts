import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useMemo, useState } from 'react'
import { hasPermission } from '@/features/auth/rbac'
import { REPORT_RBAC } from '@/features/auth/rbac-requirements'
import { useRbac } from '@/features/auth/use-rbac'
import { listReports } from '@/features/reports/report-api'
import {
  applyReportFilters,
  DEFAULT_REPORT_FILTERS,
} from '@/features/reports/report-filters'
import type { Report, ReportFilters, ReportViewMode } from '@/features/reports/report-types'
import { queryKeys } from '@/lib/query-keys'

const VIEW_MODE_STORAGE_KEY = 'datadash.reports.viewMode'
const REPORTS_FETCH_LIMIT = 100

function readStoredViewMode(): ReportViewMode {
  if (typeof window === 'undefined') {
    return 'grid'
  }

  const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
  return stored === 'table' ? 'table' : 'grid'
}

export function useReportListState() {
  const navigate = useNavigate()
  const rbac = useRbac()
  const canCreate = hasPermission(rbac, REPORT_RBAC.create)
  const canEdit = hasPermission(rbac, REPORT_RBAC.update)
  const canDelete = hasPermission(rbac, REPORT_RBAC.delete)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_REPORT_FILTERS)
  const [draftFilters, setDraftFilters] = useState<ReportFilters>(DEFAULT_REPORT_FILTERS)
  const [viewMode, setViewModeState] = useState<ReportViewMode>(readStoredViewMode)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)

  const reportsQuery = useQuery({
    queryKey: queryKeys.report.list({ limit: REPORTS_FETCH_LIMIT }),
    queryFn: () => listReports({ page: 1, limit: REPORTS_FETCH_LIMIT }),
  })

  const reports = reportsQuery.data?.items ?? []
  const totalCount = reportsQuery.data?.totalCount ?? 0

  const filteredReports = useMemo(
    () => applyReportFilters(reports, search, filters),
    [reports, search, filters],
  )

  const filteredCount = filteredReports.length

  const setViewMode = useCallback((mode: ReportViewMode) => {
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

  const applyFilters = useCallback((nextFilters: ReportFilters) => {
    setFilters(nextFilters)
    setDraftFilters(nextFilters)
    setFilterDialogOpen(false)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_REPORT_FILTERS)
    setDraftFilters(DEFAULT_REPORT_FILTERS)
  }, [])

  const refresh = useCallback(async () => {
    await reportsQuery.refetch()
  }, [reportsQuery])

  const handleCreate = useCallback(() => {
    if (!canCreate) return
    void navigate({ to: '/relatorios/novo' })
  }, [canCreate, navigate])

  const handleEdit = useCallback(
    (report: Report) => {
      if (!canEdit) return
      void navigate({
        to: '/relatorios/$relatorioId/editar',
        params: { relatorioId: String(report.id) },
      })
    },
    [canEdit, navigate],
  )

  return {
    reports,
    filteredReports,
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
    isLoading: reportsQuery.isLoading,
    isError: reportsQuery.isError,
    error: reportsQuery.error,
    isRefreshing: reportsQuery.isFetching && !reportsQuery.isLoading,
    refresh,
    filterDialogOpen,
    openFilterDialog,
    closeFilterDialog,
    handleCreate,
    handleEdit,
  }
}
