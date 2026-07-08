import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { createConnection } from '@/features/connections/connection-api'
import type {
  ConnectionCreateSaveMode,
  ConnectionEditDraft,
  ConnectionFieldErrors,
} from '@/features/connections/connection-types'
import { INITIAL_CONNECTION_CREATE_DRAFT } from '@/features/connections/connection-types'
import {
  parseConnectionFieldErrors,
  validateConnectionDraft,
} from '@/features/connections/connection-validation'
import { queryKeys } from '@/lib/query-keys'

const CONNECTIONS_FETCH_LIMIT = 100

type CreateConnectionMutationInput = {
  draft: ConnectionEditDraft
  mode: ConnectionCreateSaveMode
}

export function useConnectionCreateState() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<ConnectionEditDraft>(INITIAL_CONNECTION_CREATE_DRAFT)
  const [fieldErrors, setFieldErrors] = useState<ConnectionFieldErrors>({})

  const createMutation = useMutation({
    mutationFn: ({ draft: input }: CreateConnectionMutationInput) => createConnection(input),
    onSuccess: async (createdConnection, { mode }) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.connection.list({ limit: CONNECTIONS_FETCH_LIMIT }),
      })

      if (mode === 'edit') {
        void navigate({
          to: '/conexoes/$conexaoId/editar',
          params: { conexaoId: String(createdConnection.id) },
        })
        return
      }

      void navigate({ to: '/conexoes' })
    },
    onError: (error) => {
      setFieldErrors(parseConnectionFieldErrors(error))
    },
  })

  const updateDraft = useCallback((patch: Partial<ConnectionEditDraft>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setFieldErrors({})
  }, [])

  const save = useCallback(
    async (mode: ConnectionCreateSaveMode) => {
      const validationErrors = validateConnectionDraft(draft, { requirePassword: true })

      if (Object.keys(validationErrors).length > 0) {
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
