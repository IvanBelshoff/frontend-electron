import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { deleteDashboard } from '@/features/dashboards/dashboard-api'
import type { Dashboard } from '@/features/dashboards/dashboard-types'
import { ApiError } from '@/features/auth/auth-types'
import { queryKeys } from '@/lib/query-keys'

const DASHBOARDS_FETCH_LIMIT = 100

type UseDashboardDeleteDialogOptions = {
  redirectToListOnSuccess?: boolean
}

export function useDashboardDeleteDialog(options: UseDashboardDeleteDialogOptions = {}) {
  const { redirectToListOnSuccess = false } = options
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<Dashboard | null>(null)
  const [error, setError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDashboard(id),
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.dashboard.detail(id) })
      queryClient.removeQueries({ queryKey: queryKeys.dashboard.access(id) })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.list({ limit: DASHBOARDS_FETCH_LIMIT }),
      })

      setDeleteTarget(null)
      setError(null)

      if (redirectToListOnSuccess) {
        void navigate({ to: '/dashboards' })
      }
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof ApiError
          ? mutationError.message
          : mutationError instanceof Error
            ? mutationError.message
            : 'Não foi possível excluir o dashboard.',
      )
    },
  })

  const requestDelete = useCallback((dashboard: Dashboard) => {
    setDeleteTarget(dashboard)
    setError(null)
  }, [])

  const cancelDelete = useCallback(() => {
    if (deleteMutation.isPending) {
      return
    }

    setDeleteTarget(null)
    setError(null)
  }, [deleteMutation.isPending])

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) {
      return
    }

    await deleteMutation.mutateAsync(deleteTarget.id)
  }, [deleteMutation, deleteTarget])

  return {
    deleteTarget,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting: deleteMutation.isPending,
    error,
  }
}
