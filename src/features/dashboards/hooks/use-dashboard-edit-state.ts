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
import { ApiError } from '@/features/auth/auth-types'
import { queryKeys } from '@/lib/query-keys'

const DASHBOARDS_FETCH_LIMIT = 100

function parseFieldErrors(error: unknown): DashboardFieldErrors {
  if (!(error instanceof ApiError) || error.statusCode !== 409) {
    return { general: error instanceof Error ? error.message : 'Falha ao salvar dashboard.' }
  }

  const body = error.body as { errors?: { nome?: string; url?: string }; message?: string } | undefined
  const fieldErrors: DashboardFieldErrors = {}

  if (body?.errors?.nome) fieldErrors.nome = body.errors.nome
  if (body?.errors?.url) fieldErrors.url = body.errors.url

  if (!fieldErrors.nome && !fieldErrors.url) {
    fieldErrors.general = error.message
  }

  return fieldErrors
}

function validateDraft(draft: DashboardEditDraft): DashboardFieldErrors {
  const errors: DashboardFieldErrors = {}

  if (!draft.nome.trim()) {
    errors.nome = 'Nome é obrigatório.'
  }

  if (!draft.url.trim()) {
    errors.url = 'URL é obrigatória.'
  }

  if (draft.temporario) {
    if (!draft.dataExpiracaoInicial) {
      errors.general = 'Data de expiração inicial é obrigatória para dashboards temporários.'
    }

    if (!draft.dataExpiracaoFinal) {
      errors.general = 'Data de expiração final é obrigatória para dashboards temporários.'
    }

    if (
      draft.dataExpiracaoInicial &&
      draft.dataExpiracaoFinal &&
      draft.dataExpiracaoFinal < draft.dataExpiracaoInicial
    ) {
      errors.general = 'A data final deve ser igual ou posterior à data inicial.'
    }
  }

  return errors
}

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
      setFieldErrors(parseFieldErrors(error))
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

    const validationErrors = validateDraft(draft)

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

  const handleDelete = useCallback(() => {
    console.log('[dashboards] Excluir dashboard', dashboardId)
  }, [dashboardId])

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
    handleDelete,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    isSaving: saveMutation.isPending,
    isRefreshing: dashboardQuery.isFetching && !dashboardQuery.isLoading,
  }
}
