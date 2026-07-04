import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { deleteUser } from '@/features/user/user-api'
import type { UserDeleteTarget } from '@/features/user/user-edit-types'
import type { ManagedUser } from '@/features/user/user-list-types'
import { getUserDisplayName } from '@/features/user/user-list-types'
import { ApiError } from '@/features/auth/auth-types'
import { queryKeys } from '@/lib/query-keys'

const USERS_FETCH_LIMIT = 100

type UseUserDeleteDialogOptions = {
  redirectToListOnSuccess?: boolean
}

export function useUserDeleteDialog(options: UseUserDeleteDialogOptions = {}) {
  const { redirectToListOnSuccess = false } = options
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<UserDeleteTarget | null>(null)
  const [error, setError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.user.detail(id) })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.user.list({ limit: USERS_FETCH_LIMIT }),
      })

      setDeleteTarget(null)
      setError(null)

      if (redirectToListOnSuccess) {
        void navigate({ to: '/usuarios' })
      }
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof ApiError
          ? mutationError.message
          : mutationError instanceof Error
            ? mutationError.message
            : 'Não foi possível excluir o usuário.',
      )
    },
  })

  const requestDelete = useCallback((user: ManagedUser | UserDeleteTarget) => {
    const displayName =
      'displayName' in user ? user.displayName : getUserDisplayName(user)

    setDeleteTarget({ id: user.id, displayName })
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
