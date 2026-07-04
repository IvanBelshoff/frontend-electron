import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useMemo, useState } from 'react'
import { listUsers } from '@/features/user/user-api'
import { applyUserFilters } from '@/features/user/user-filters'
import type { ManagedUser, UserViewMode } from '@/features/user/user-list-types'
import { queryKeys } from '@/lib/query-keys'

const VIEW_MODE_STORAGE_KEY = 'datadash.users.viewMode'
const USERS_FETCH_LIMIT = 100

function readStoredViewMode(): UserViewMode {
  if (typeof window === 'undefined') {
    return 'grid'
  }

  const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
  return stored === 'table' ? 'table' : 'grid'
}

export function useUserListState() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [viewMode, setViewModeState] = useState<UserViewMode>(readStoredViewMode)

  const usersQuery = useQuery({
    queryKey: queryKeys.user.list({ limit: USERS_FETCH_LIMIT }),
    queryFn: () => listUsers({ page: 1, limit: USERS_FETCH_LIMIT }),
  })

  const users = usersQuery.data?.items ?? []
  const totalCount = usersQuery.data?.totalCount ?? 0

  const filteredUsers = useMemo(
    () => applyUserFilters(users, search),
    [users, search],
  )

  const filteredCount = filteredUsers.length

  const setViewMode = useCallback((mode: UserViewMode) => {
    setViewModeState(mode)
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode)
  }, [])

  const clearSearch = useCallback(() => {
    setSearch('')
  }, [])

  const refresh = useCallback(async () => {
    await usersQuery.refetch()
  }, [usersQuery])

  const handleCreate = useCallback(() => {
    // TODO: navegar para criação de usuário
  }, [])

  const handleEdit = useCallback(
    (user: ManagedUser) => {
      void navigate({
        to: '/usuarios/$userId/editar',
        params: { userId: String(user.id) },
      })
    },
    [navigate],
  )

  return {
    users,
    filteredUsers,
    totalCount,
    filteredCount,
    search,
    setSearch,
    clearSearch,
    viewMode,
    setViewMode,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    isRefreshing: usersQuery.isFetching && !usersQuery.isLoading,
    refresh,
    handleCreate,
    handleEdit,
  }
}
