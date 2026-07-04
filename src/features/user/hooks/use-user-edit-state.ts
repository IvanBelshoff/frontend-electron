import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { getManagedUserById } from '@/features/user/user-api'
import { mapManagedUserToEditDraft } from '@/features/user/user-mapper'
import type { UserEditDraft, UserEditTab } from '@/features/user/user-edit-types'
import type { ManagedUser } from '@/features/user/user-list-types'
import { queryKeys } from '@/lib/query-keys'

export function useUserEditState(userId: number) {
  const [activeTab, setActiveTab] = useState<UserEditTab>('user')
  const [draft, setDraft] = useState<UserEditDraft | null>(null)

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
  }, [user])

  const updateDraft = useCallback((patch: Partial<UserEditDraft>) => {
    setDraft((current) => {
      if (!current) {
        return current
      }

      return { ...current, ...patch }
    })
  }, [])

  const refresh = useCallback(async () => {
    await userQuery.refetch()
  }, [userQuery])

  return {
    user: user as ManagedUser | undefined,
    draft,
    activeTab,
    setActiveTab,
    updateDraft,
    refresh,
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,
    error: userQuery.error,
    isRefreshing: userQuery.isFetching && !userQuery.isLoading,
  }
}
