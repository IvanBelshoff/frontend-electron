import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { deleteReport } from '@/features/reports/report-api'
import type { Report } from '@/features/reports/report-types'
import { ApiError } from '@/features/auth/auth-types'
import { queryKeys } from '@/lib/query-keys'

const REPORTS_FETCH_LIMIT = 100

type UseReportDeleteDialogOptions = {
  redirectToListOnSuccess?: boolean
}

export function useReportDeleteDialog(options: UseReportDeleteDialogOptions = {}) {
  const { redirectToListOnSuccess = false } = options
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteReport(id),
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.report.detail(id) })
      queryClient.removeQueries({ queryKey: queryKeys.report.access(id) })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.report.list({ limit: REPORTS_FETCH_LIMIT }),
      })

      setDeleteTarget(null)
      setError(null)

      if (redirectToListOnSuccess) {
        void navigate({ to: '/relatorios/gerenciar' })
      }
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof ApiError
          ? mutationError.message
          : mutationError instanceof Error
            ? mutationError.message
            : 'Não foi possível excluir o relatório.',
      )
    },
  })

  const requestDelete = useCallback((report: Report) => {
    setDeleteTarget(report)
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
