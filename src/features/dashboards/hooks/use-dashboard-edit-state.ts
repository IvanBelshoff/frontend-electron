import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDashboard, updateDashboard } from '@/features/dashboards/dashboard-api'
import {
  areDashboardDraftsEqual,
  mapDashboardToEditDraft,
} from '@/features/dashboards/dashboard-mapper'
import type {
  Dashboard,
  DashboardEditDraft,
  DashboardEditTab,
  DashboardFieldErrors,
} from '@/features/dashboards/dashboard-types'
import {
  parseDashboardFieldErrors,
  validateDashboardDraft,
} from '@/features/dashboards/dashboard-validation'
import { queryKeys } from '@/lib/query-keys'

const DASHBOARDS_FETCH_LIMIT = 100

export function useDashboardEditState(dashboardId: number) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<DashboardEditTab>('dashboard')
  const [draft, setDraft] = useState<DashboardEditDraft | null>(null)
  const [fieldErrors, setFieldErrors] = useState<DashboardFieldErrors>({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard.detail(dashboardId),
    queryFn: () => getDashboard(dashboardId),
    enabled: Number.isFinite(dashboardId) && dashboardId > 0,
  })

  const dashboard = dashboardQuery.data

  useEffect(() => {
    if (!dashboard) {
      return
    }

    setDraft(mapDashboardToEditDraft(dashboard))
    setFieldErrors({})
    setSaveSuccess(false)
  }, [dashboard])

  const originalDraft = useMemo(
    () => (dashboard ? mapDashboardToEditDraft(dashboard) : null),
    [dashboard],
  )

  const isDirty = useMemo(() => {
    if (!draft || !originalDraft) {
      return false
    }

    return !areDashboardDraftsEqual(draft, originalDraft)
  }, [draft, originalDraft])

  const saveMutation = useMutation({
    mutationFn: (input: DashboardEditDraft) => updateDashboard(dashboardId, input),
    onSuccess: (updatedDashboard: Dashboard) => {
      queryClient.setQueryData<Dashboard>(
        queryKeys.dashboard.detail(dashboardId),
        (previous) => ({
          ...updatedDashboard,
          usuarios: updatedDashboard.usuarios ?? previous?.usuarios,
        }),
      )
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.list({ limit: DASHBOARDS_FETCH_LIMIT }),
      })
      setDraft(mapDashboardToEditDraft(updatedDashboard))
      setFieldErrors({})
      setSaveSuccess(true)
    },
    onError: (error) => {
      setFieldErrors(parseDashboardFieldErrors(error))
      setSaveSuccess(false)
    },
  })

  const updateDraft = useCallback((patch: Partial<DashboardEditDraft>) => {
    setDraft((current) => {
      if (!current) {
        return current
      }

      const next = { ...current, ...patch }

      if (patch.temporario === false) {
        next.dataExpiracaoInicial = null
        next.dataExpiracaoFinal = null
      }

      return next
    })
    setFieldErrors({})
    setSaveSuccess(false)
  }, [])

  const cancelEdit = useCallback(() => {
    if (!originalDraft) {
      return
    }

    setDraft({ ...originalDraft })
    setFieldErrors({})
    setSaveSuccess(false)
  }, [originalDraft])

  const saveEdit = useCallback(async () => {
    if (!draft) {
      return
    }

    const validationErrors = validateDashboardDraft(draft)

    if (validationErrors.nome || validationErrors.url || validationErrors.general) {
      setFieldErrors(validationErrors)
      setSaveSuccess(false)
      return
    }

    await saveMutation.mutateAsync(draft)
  }, [draft, saveMutation])

  const refresh = useCallback(async () => {
    await dashboardQuery.refetch()
  }, [dashboardQuery])

  return {
    dashboard,
    draft,
    activeTab,
    setActiveTab,
    updateDraft,
    isDirty,
    fieldErrors,
    saveSuccess,
    saveEdit,
    cancelEdit,
    refresh,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    isSaving: saveMutation.isPending,
    isRefreshing: dashboardQuery.isFetching && !dashboardQuery.isLoading,
  }
}
