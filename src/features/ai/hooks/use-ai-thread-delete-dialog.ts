import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { deleteAiThread } from '@/features/ai/ai-chat-api'
import type { AiChatThread } from '@/features/ai/ai-chat-types'
import { ApiError } from '@/features/auth/auth-types'
import { queryKeys } from '@/lib/query-keys'

type DeleteTarget = {
  id: string
  titulo: string
}

type UseAiThreadDeleteDialogOptions = {
  activeThreadId?: string
  onActiveThreadDeleted?: () => void
}

export function useAiThreadDeleteDialog({
  activeThreadId,
  onActiveThreadDeleted,
}: UseAiThreadDeleteDialogOptions = {}) {
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [error, setError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (threadId: string) => deleteAiThread(threadId),
    onSuccess: async (_result, deletedThreadId) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.ai.threads })
      setDeleteTarget(null)
      setError(null)

      if (activeThreadId === deletedThreadId) {
        onActiveThreadDeleted?.()
      }
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof ApiError
          ? mutationError.message
          : mutationError instanceof Error
            ? mutationError.message
            : 'Não foi possível excluir a conversa.',
      )
    },
  })

  const requestDelete = useCallback((thread: AiChatThread) => {
    setDeleteTarget({
      id: thread.id,
      titulo: thread.titulo?.trim() || 'Nova conversa',
    })
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
