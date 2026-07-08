import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getConnection, updateConnection } from '@/features/connections/connection-api'
import {
  areConnectionDraftsEqual,
  mapConnectionToEditDraft,
} from '@/features/connections/connection-mapper'
import type {
  Connection,
  ConnectionEditDraft,
  ConnectionFieldErrors,
} from '@/features/connections/connection-types'
import {
  parseConnectionFieldErrors,
  validateConnectionDraft,
} from '@/features/connections/connection-validation'
import { queryKeys } from '@/lib/query-keys'

const CONNECTIONS_FETCH_LIMIT = 100

export function useConnectionEditState(connectionId: number) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<ConnectionEditDraft | null>(null)
  const [fieldErrors, setFieldErrors] = useState<ConnectionFieldErrors>({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  const connectionQuery = useQuery({
    queryKey: queryKeys.connection.detail(connectionId),
    queryFn: () => getConnection(connectionId),
    enabled: Number.isFinite(connectionId) && connectionId > 0,
  })

  const connection = connectionQuery.data

  useEffect(() => {
    if (!connection) {
      return
    }

    setDraft(mapConnectionToEditDraft(connection))
    setFieldErrors({})
    setSaveSuccess(false)
  }, [connection])

  const originalDraft = useMemo(
    () => (connection ? mapConnectionToEditDraft(connection) : null),
    [connection],
  )

  const isDirty = useMemo(() => {
    if (!draft || !originalDraft) {
      return false
    }

    return !areConnectionDraftsEqual(draft, originalDraft)
  }, [draft, originalDraft])

  const saveMutation = useMutation({
    mutationFn: (input: ConnectionEditDraft) => updateConnection(connectionId, input),
    onSuccess: (updatedConnection: Connection) => {
      queryClient.setQueryData<Connection>(
        queryKeys.connection.detail(connectionId),
        updatedConnection,
      )
      void queryClient.invalidateQueries({
        queryKey: queryKeys.connection.list({ limit: CONNECTIONS_FETCH_LIMIT }),
      })
      setDraft(mapConnectionToEditDraft(updatedConnection))
      setFieldErrors({})
      setSaveSuccess(true)
    },
    onError: (error) => {
      setFieldErrors(parseConnectionFieldErrors(error))
      setSaveSuccess(false)
    },
  })

  const updateDraft = useCallback((patch: Partial<ConnectionEditDraft>) => {
    setDraft((current) => {
      if (!current) {
        return current
      }

      return { ...current, ...patch }
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

    const validationErrors = validateConnectionDraft(draft)

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setSaveSuccess(false)
      return
    }

    await saveMutation.mutateAsync(draft)
  }, [draft, saveMutation])

  const refresh = useCallback(async () => {
    await connectionQuery.refetch()
  }, [connectionQuery])

  return {
    connection,
    draft,
    updateDraft,
    isDirty,
    fieldErrors,
    saveSuccess,
    saveEdit,
    cancelEdit,
    refresh,
    isLoading: connectionQuery.isLoading,
    isError: connectionQuery.isError,
    error: connectionQuery.error,
    isSaving: saveMutation.isPending,
    isRefreshing: connectionQuery.isFetching && !connectionQuery.isLoading,
  }
}
