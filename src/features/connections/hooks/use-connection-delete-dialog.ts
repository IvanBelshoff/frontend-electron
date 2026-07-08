import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { deleteConnection } from '@/features/connections/connection-api'
import type { Connection } from '@/features/connections/connection-types'
import { ApiError } from '@/features/auth/auth-types'
import { queryKeys } from '@/lib/query-keys'

const CONNECTIONS_FETCH_LIMIT = 100

type UseConnectionDeleteDialogOptions = {
  redirectToListOnSuccess?: boolean
}

export function useConnectionDeleteDialog(options: UseConnectionDeleteDialogOptions = {}) {
  const { redirectToListOnSuccess = false } = options
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<Connection | null>(null)
  const [error, setError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteConnection(id),
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.connection.detail(id) })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.connection.list({ limit: CONNECTIONS_FETCH_LIMIT }),
      })

      setDeleteTarget(null)
      setError(null)

      if (redirectToListOnSuccess) {
        void navigate({ to: '/conexoes' })
      }
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof ApiError
          ? mutationError.message
          : mutationError instanceof Error
            ? mutationError.message
            : 'Não foi possível excluir a conexão.',
      )
    },
  })

  const requestDelete = useCallback((connection: Connection) => {
    setDeleteTarget(connection)
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
