import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { createDashboard } from '@/features/dashboards/dashboard-api'
import type {
  DashboardCreateSaveMode,
  DashboardEditDraft,
  DashboardFieldErrors,
} from '@/features/dashboards/dashboard-types'
import { INITIAL_DASHBOARD_CREATE_DRAFT } from '@/features/dashboards/dashboard-types'
import {
  parseDashboardFieldErrors,
  validateDashboardDraft,
} from '@/features/dashboards/dashboard-validation'
import { queryKeys } from '@/lib/query-keys'

const DASHBOARDS_FETCH_LIMIT = 100

type CreateDashboardMutationInput = {
  draft: DashboardEditDraft
  mode: DashboardCreateSaveMode
}

export function useDashboardCreateState() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<DashboardEditDraft>(INITIAL_DASHBOARD_CREATE_DRAFT)
  const [fieldErrors, setFieldErrors] = useState<DashboardFieldErrors>({})

  const createMutation = useMutation({
    mutationFn: ({ draft: input }: CreateDashboardMutationInput) => createDashboard(input),
    onSuccess: async (createdDashboard, { mode }) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.list({ limit: DASHBOARDS_FETCH_LIMIT }),
      })

      if (mode === 'edit') {
        void navigate({
          to: '/dashboards/$dashboardId/editar',
          params: { dashboardId: String(createdDashboard.id) },
        })
        return
      }

      void navigate({ to: '/dashboards' })
    },
    onError: (error) => {
      setFieldErrors(parseDashboardFieldErrors(error))
    },
  })

  const updateDraft = useCallback((patch: Partial<DashboardEditDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...patch }

      if (patch.temporario === false) {
        next.dataExpiracaoInicial = null
        next.dataExpiracaoFinal = null
      }

      return next
    })
    setFieldErrors({})
  }, [])

  const save = useCallback(
    async (mode: DashboardCreateSaveMode) => {
      const validationErrors = validateDashboardDraft(draft)

      if (validationErrors.nome || validationErrors.url || validationErrors.general) {
        setFieldErrors(validationErrors)
        return
      }

      await createMutation.mutateAsync({ draft, mode })
    },
    [createMutation, draft],
  )

  const saveToList = useCallback(async () => {
    await save('list')
  }, [save])

  const saveAndEdit = useCallback(async () => {
    await save('edit')
  }, [save])

  return {
    draft,
    updateDraft,
    fieldErrors,
    saveToList,
    saveAndEdit,
    isSaving: createMutation.isPending,
  }
}
