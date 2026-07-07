import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useMemo, useState } from 'react'
import { listUsers } from '@/features/user/user-api'
import {
  buildUserListQueryParams,
  DEFAULT_USER_FILTERS,
  type UserFilters,
} from '@/features/user/user-list-filters'
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
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_USER_FILTERS)
  const [draftFilters, setDraftFilters] = useState<UserFilters>(DEFAULT_USER_FILTERS)
  const [viewMode, setViewModeState] = useState<UserViewMode>(readStoredViewMode)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)

  const listParams = useMemo(
    () => buildUserListQueryParams(search, filters, USERS_FETCH_LIMIT),
    [filters, search],
  )

  const usersQuery = useQuery({
    queryKey: queryKeys.user.list(listParams),
    queryFn: () => listUsers(listParams),
  })

  const filteredUsers = usersQuery.data?.items ?? []
  const totalCount = usersQuery.data?.totalCount ?? 0
  const filteredCount = filteredUsers.length

  const setViewMode = useCallback((mode: UserViewMode) => {
    setViewModeState(mode)
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode)
  }, [])

  const openFilterDialog = useCallback(() => {
    setDraftFilters(filters)
    setFilterDialogOpen(true)
  }, [filters])

  const closeFilterDialog = useCallback(() => {
    setFilterDialogOpen(false)
  }, [])

  const applyFilters = useCallback((nextFilters: UserFilters) => {
    setFilters(nextFilters)
    setDraftFilters(nextFilters)
    setFilterDialogOpen(false)
  }, [])

  const clearFilters = useCallback(() => {
    setSearch('')
    setFilters(DEFAULT_USER_FILTERS)
    setDraftFilters(DEFAULT_USER_FILTERS)
  }, [])

  const refresh = useCallback(async () => {
    await usersQuery.refetch()
  }, [usersQuery])

  const handleCreate = useCallback(() => {
    void navigate({ to: '/usuarios/criar' })
  }, [navigate])

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
    filteredUsers,
    totalCount,
    filteredCount,
    search,
    setSearch,
    filters,
    draftFilters,
    setDraftFilters,
    applyFilters,
    clearFilters,
    viewMode,
    setViewMode,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    isRefreshing: usersQuery.isFetching && !usersQuery.isLoading,
    refresh,
    filterDialogOpen,
    openFilterDialog,
    closeFilterDialog,
    handleCreate,
    handleEdit,
  }
}
