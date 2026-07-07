import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getManagedUserById, updateUser } from '@/features/user/user-api'
import {
  areUserDraftsEqual,
  mapManagedUserToEditDraft,
  mergeManagedUserAfterUpdate,
  normalizeUserEditDraft,
} from '@/features/user/user-mapper'
import type { UserEditDraft, UserEditTab, UserFieldErrors } from '@/features/user/user-edit-types'
import type { ManagedUser } from '@/features/user/user-list-types'
import { parseUserFieldErrors, validateUserDraft } from '@/features/user/user-validation'
import { queryKeys } from '@/lib/query-keys'

const USERS_FETCH_LIMIT = 100

export function useUserEditState(userId: number) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<UserEditTab>('user')
  const [draft, setDraft] = useState<UserEditDraft | null>(null)
  const [fieldErrors, setFieldErrors] = useState<UserFieldErrors>({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  const userQuery = useQuery({
    queryKey: queryKeys.user.detail(userId),
    queryFn: () => getManagedUserById(userId),
    enabled: Number.isFinite(userId) && userId > 0,
  })

  const user = userQuery.data

  useEffect(() => {
    if (!user) {
      return
    }

    setDraft(mapManagedUserToEditDraft(user))
    setFieldErrors({})
    setSaveSuccess(false)
  }, [user])

  const originalDraft = useMemo(
    () => (user ? mapManagedUserToEditDraft(user) : null),
    [user],
  )

  const isDirty = useMemo(() => {
    if (!draft || !originalDraft) {
      return false
    }

    return !areUserDraftsEqual(draft, originalDraft)
  }, [draft, originalDraft])

  const saveMutation = useMutation({
    mutationFn: (input: UserEditDraft) => updateUser(userId, input),
    onSuccess: (updatedUser: ManagedUser) => {
      queryClient.setQueryData<ManagedUser>(queryKeys.user.detail(userId), (previous) => {
        if (!previous) {
          return updatedUser
        }

        return mergeManagedUserAfterUpdate(previous, updatedUser)
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.user.list({ limit: USERS_FETCH_LIMIT }),
      })
      setDraft(mapManagedUserToEditDraft(updatedUser))
      setFieldErrors({})
      setSaveSuccess(true)
    },
    onError: (error) => {
      setFieldErrors(parseUserFieldErrors(error))
      setSaveSuccess(false)
    },
  })

  const updateDraft = useCallback((patch: Partial<UserEditDraft>) => {
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

    const normalizedDraft = normalizeUserEditDraft(draft)
    const validationErrors = validateUserDraft(normalizedDraft)

    if (
      validationErrors.nome ||
      validationErrors.sobrenome ||
      validationErrors.email ||
      validationErrors.general
    ) {
      setFieldErrors(validationErrors)
      setSaveSuccess(false)
      return
    }

    await saveMutation.mutateAsync(normalizedDraft)
  }, [draft, saveMutation])

  const refresh = useCallback(async () => {
    await userQuery.refetch()
  }, [userQuery])

  return {
    user: user as ManagedUser | undefined,
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
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,
    error: userQuery.error,
    isSaving: saveMutation.isPending,
    isRefreshing: userQuery.isFetching && !userQuery.isLoading,
  }
}
