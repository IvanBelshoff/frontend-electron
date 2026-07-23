import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAuditLog, listAuditActions, listAuditLogs } from '@/features/audit/audit-api'
import type { AuditAdvancedFilters, AuditFilters } from '@/features/audit/audit-types'
import { queryKeys } from '@/lib/query-keys'

const DEFAULT_PAGE_SIZE = 50
const QUICK_SEARCH_DEBOUNCE_MS = 400
const ACTIONS_STALE_TIME_MS = 5 * 60 * 1000

const DEFAULT_ADVANCED_FILTERS: AuditAdvancedFilters = {}

const DEFAULT_APPLIED_FILTERS: AuditFilters = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
}

function stripAdvancedFilters(filters: AuditFilters): AuditAdvancedFilters {
  const { page: _page, pageSize: _pageSize, search: _search, ...advanced } = filters
  return advanced
}

function countActiveAdvancedFilters(filters: AuditAdvancedFilters): number {
  return Object.values(filters).filter((value) => value !== undefined && value !== '').length
}

export function useAdminAuditState() {
  const queryClient = useQueryClient()
  const [appliedFilters, setAppliedFilters] = useState<AuditFilters>(DEFAULT_APPLIED_FILTERS)
  const [draftFilters, setDraftFilters] = useState<AuditAdvancedFilters>(DEFAULT_ADVANCED_FILTERS)
  const [quickSearch, setQuickSearch] = useState('')
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const trimmed = quickSearch.trim()

      setAppliedFilters((current) => {
        const nextSearch = trimmed || undefined

        if (current.search === nextSearch) {
          return current
        }

        return {
          ...current,
          page: 1,
          search: nextSearch,
        }
      })
    }, QUICK_SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [quickSearch])

  const logsQuery = useQuery({
    queryKey: queryKeys.adminAuditLogs(appliedFilters as unknown as Record<string, unknown>),
    queryFn: () => listAuditLogs(appliedFilters),
  })

  const actionsQuery = useQuery({
    queryKey: queryKeys.adminAuditActions,
    queryFn: listAuditActions,
    staleTime: ACTIONS_STALE_TIME_MS,
  })

  const detailQuery = useQuery({
    queryKey: queryKeys.adminAuditLog(selectedLogId ?? undefined),
    queryFn: () => getAuditLog(selectedLogId!),
    enabled: Boolean(selectedLogId),
  })

  const totalPages = useMemo(() => {
    const total = logsQuery.data?.total ?? 0
    return Math.max(1, Math.ceil(total / appliedFilters.pageSize))
  }, [appliedFilters.pageSize, logsQuery.data?.total])

  const activeAdvancedFilterCount = useMemo(
    () => countActiveAdvancedFilters(stripAdvancedFilters(appliedFilters)),
    [appliedFilters],
  )

  const applyFilters = useCallback((nextFilters: AuditAdvancedFilters) => {
    setDraftFilters(nextFilters)
    setAppliedFilters((current) => ({
      page: 1,
      pageSize: current.pageSize,
      search: current.search,
      actorUserId: nextFilters.actorUserId,
      action: nextFilters.action,
      category: nextFilters.category,
      outcome: nextFilters.outcome,
      resourceType: nextFilters.resourceType,
      resourceId: nextFilters.resourceId,
      from: nextFilters.from,
      to: nextFilters.to,
    }))
    setFilterDialogOpen(false)
  }, [])

  const openFilterDialog = useCallback(() => {
    setDraftFilters(stripAdvancedFilters(appliedFilters))
    setFilterDialogOpen(true)
  }, [appliedFilters])

  const closeFilterDialog = useCallback(() => {
    setFilterDialogOpen(false)
  }, [])

  const clearFilters = useCallback(() => {
    setDraftFilters(DEFAULT_ADVANCED_FILTERS)
    setQuickSearch('')
    setAppliedFilters({
      page: 1,
      pageSize: appliedFilters.pageSize,
    })
  }, [appliedFilters.pageSize])

  const removeAdvancedFilter = useCallback((key: keyof AuditAdvancedFilters) => {
    setDraftFilters((current) => {
      const next = { ...current }
      delete next[key]
      return next
    })

    setAppliedFilters((current) => {
      const next = { ...current, page: 1 }
      delete next[key]
      return next
    })
  }, [])

  const goToPage = useCallback((page: number) => {
    setAppliedFilters((current) => ({ ...current, page }))
  }, [])

  const setPageSize = useCallback((pageSize: number) => {
    setAppliedFilters((current) => ({ ...current, page: 1, pageSize }))
  }, [])

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['admin-audit'] })
  }, [queryClient])

  const openLogDetail = useCallback((logId: string) => {
    setSelectedLogId(logId)
  }, [])

  const closeLogDetail = useCallback(() => {
    setSelectedLogId(null)
  }, [])

  return {
    logs: logsQuery.data?.items ?? [],
    total: logsQuery.data?.total ?? 0,
    page: appliedFilters.page,
    pageSize: appliedFilters.pageSize,
    totalPages,
    appliedFilters,
    draftFilters,
    setDraftFilters,
    quickSearch,
    setQuickSearch,
    activeAdvancedFilterCount,
    actions: actionsQuery.data?.actions ?? [],
    isActionsLoading: actionsQuery.isLoading,
    applyFilters,
    clearFilters,
    removeAdvancedFilter,
    goToPage,
    setPageSize,
    refresh,
    filterDialogOpen,
    openFilterDialog,
    closeFilterDialog,
    isLoading: logsQuery.isLoading,
    isFetching: logsQuery.isFetching,
    isError: logsQuery.isError,
    error: logsQuery.error,
    selectedLogId,
    selectedLog: detailQuery.data ?? null,
    isDetailLoading: detailQuery.isLoading,
    openLogDetail,
    closeLogDetail,
  }
}
