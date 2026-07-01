import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { assignDashboardUsers } from '@/features/dashboards/dashboard-api'
import {
  filterAccessUsersBySearch,
  sortAccessUsers,
} from '@/features/dashboards/dashboard-access-utils'
import type { Dashboard } from '@/features/dashboards/dashboard-types'
import { getUsersByDashboard } from '@/features/user/user-api'
import type { AccessUser } from '@/features/user/user-types'
import { ApiError } from '@/features/auth/auth-types'
import { queryKeys } from '@/lib/query-keys'

type AccessColumn = 'available' | 'granted'

function normalizeLists(available: AccessUser[], granted: AccessUser[]) {
  return {
    available: sortAccessUsers(available),
    granted: sortAccessUsers(granted),
  }
}

export function useDashboardAccessState(
  dashboardId: number,
  dashboard: Dashboard | undefined,
  enabled: boolean,
) {
  const queryClient = useQueryClient()
  const [availableUsers, setAvailableUsers] = useState<AccessUser[]>([])
  const [grantedUsers, setGrantedUsers] = useState<AccessUser[]>([])
  const [selectedAvailableIds, setSelectedAvailableIds] = useState<number[]>([])
  const [selectedGrantedIds, setSelectedGrantedIds] = useState<number[]>([])
  const [availableSearch, setAvailableSearch] = useState('')
  const [grantedSearch, setGrantedSearch] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isPublicDashboard = dashboard?.privacidade === 'publico'
  const ownerId = dashboard?.idProprietario ?? null

  const accessQuery = useQuery({
    queryKey: queryKeys.dashboard.access(dashboardId),
    queryFn: () => getUsersByDashboard(dashboardId),
    enabled: enabled && Number.isFinite(dashboardId) && dashboardId > 0 && !isPublicDashboard,
  })

  useEffect(() => {
    if (!accessQuery.data) {
      return
    }

    const normalized = normalizeLists(
      accessQuery.data.usuariosDisponiveis,
      accessQuery.data.usuarios,
    )

    setAvailableUsers(normalized.available)
    setGrantedUsers(normalized.granted)
    setSelectedAvailableIds([])
    setSelectedGrantedIds([])
    setErrorMessage(null)
  }, [accessQuery.data])

  const filteredAvailableUsers = useMemo(
    () => filterAccessUsersBySearch(availableUsers, availableSearch),
    [availableUsers, availableSearch],
  )

  const filteredGrantedUsers = useMemo(
    () => filterAccessUsersBySearch(grantedUsers, grantedSearch),
    [grantedUsers, grantedSearch],
  )

  const persistMutation = useMutation({
    mutationFn: (userIds: number[]) => assignDashboardUsers(dashboardId, userIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.detail(dashboardId),
      })
      setErrorMessage(null)
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Falha ao sincronizar acessos.',
      )
      void accessQuery.refetch()
    },
  })

  const persistGrantedUsers = useCallback(
    async (nextGranted: AccessUser[], nextAvailable: AccessUser[]) => {
      const previousGranted = grantedUsers
      const previousAvailable = availableUsers

      setGrantedUsers(sortAccessUsers(nextGranted))
      setAvailableUsers(sortAccessUsers(nextAvailable))
      setSelectedAvailableIds([])
      setSelectedGrantedIds([])

      try {
        await persistMutation.mutateAsync(nextGranted.map((user) => user.id))
      } catch {
        setGrantedUsers(previousGranted)
        setAvailableUsers(previousAvailable)
      }
    },
    [availableUsers, grantedUsers, persistMutation],
  )

  const toggleUserSelection = useCallback((column: AccessColumn, userId: number) => {
    if (column === 'available') {
      setSelectedAvailableIds((current) =>
        current.includes(userId)
          ? current.filter((id) => id !== userId)
          : [...current, userId],
      )
      return
    }

    if (ownerId === userId) {
      return
    }

    setSelectedGrantedIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    )
  }, [ownerId])

  const toggleSelectAll = useCallback(
    (column: AccessColumn) => {
      if (column === 'available') {
        const filteredIds = filteredAvailableUsers.map((user) => user.id)
        const allSelected =
          filteredIds.length > 0 &&
          filteredIds.every((id) => selectedAvailableIds.includes(id))

        setSelectedAvailableIds(allSelected ? [] : filteredIds)
        return
      }

      const selectableUsers = filteredGrantedUsers.filter((user) => user.id !== ownerId)
      const filteredIds = selectableUsers.map((user) => user.id)
      const allSelected =
        filteredIds.length > 0 &&
        filteredIds.every((id) => selectedGrantedIds.includes(id))

      setSelectedGrantedIds(allSelected ? [] : filteredIds)
    },
    [
      filteredAvailableUsers,
      filteredGrantedUsers,
      ownerId,
      selectedAvailableIds,
      selectedGrantedIds,
    ],
  )

  const isAllSelected = useCallback(
    (column: AccessColumn) => {
      if (column === 'available') {
        const filteredIds = filteredAvailableUsers.map((user) => user.id)
        return (
          filteredIds.length > 0 &&
          filteredIds.every((id) => selectedAvailableIds.includes(id))
        )
      }

      const selectableUsers = filteredGrantedUsers.filter((user) => user.id !== ownerId)
      const filteredIds = selectableUsers.map((user) => user.id)
      return (
        filteredIds.length > 0 && filteredIds.every((id) => selectedGrantedIds.includes(id))
      )
    },
    [
      filteredAvailableUsers,
      filteredGrantedUsers,
      ownerId,
      selectedAvailableIds,
      selectedGrantedIds,
    ],
  )

  const moveSelectedRight = useCallback(async () => {
    if (selectedAvailableIds.length === 0) {
      return
    }

    const movingUsers = availableUsers.filter((user) =>
      selectedAvailableIds.includes(user.id),
    )

    await persistGrantedUsers(
      [...grantedUsers, ...movingUsers],
      availableUsers.filter((user) => !selectedAvailableIds.includes(user.id)),
    )
  }, [availableUsers, grantedUsers, persistGrantedUsers, selectedAvailableIds])

  const moveAllRight = useCallback(async () => {
    if (filteredAvailableUsers.length === 0) {
      return
    }

    const movingIds = new Set(filteredAvailableUsers.map((user) => user.id))

    await persistGrantedUsers(
      [...grantedUsers, ...filteredAvailableUsers],
      availableUsers.filter((user) => !movingIds.has(user.id)),
    )
  }, [availableUsers, filteredAvailableUsers, grantedUsers, persistGrantedUsers])

  const moveSelectedLeft = useCallback(async () => {
    if (selectedGrantedIds.length === 0) {
      return
    }

    const movingUsers = grantedUsers.filter((user) =>
      selectedGrantedIds.includes(user.id),
    )

    await persistGrantedUsers(
      grantedUsers.filter((user) => !selectedGrantedIds.includes(user.id)),
      [...availableUsers, ...movingUsers],
    )
  }, [availableUsers, grantedUsers, persistGrantedUsers, selectedGrantedIds])

  const moveAllLeft = useCallback(async () => {
    const removableUsers = filteredGrantedUsers.filter((user) => user.id !== ownerId)

    if (removableUsers.length === 0) {
      return
    }

    const movingIds = new Set(removableUsers.map((user) => user.id))

    await persistGrantedUsers(
      grantedUsers.filter((user) => !movingIds.has(user.id)),
      [...availableUsers, ...removableUsers],
    )
  }, [availableUsers, filteredGrantedUsers, grantedUsers, ownerId, persistGrantedUsers])

  const controlsDisabled =
    isPublicDashboard || accessQuery.isLoading || persistMutation.isPending

  return {
    isPublicDashboard,
    ownerId,
    availableUsers,
    grantedUsers,
    filteredAvailableUsers,
    filteredGrantedUsers,
    selectedAvailableIds,
    selectedGrantedIds,
    availableSearch,
    setAvailableSearch,
    grantedSearch,
    setGrantedSearch,
    toggleUserSelection,
    toggleSelectAll,
    isAllSelected,
    moveSelectedRight,
    moveAllRight,
    moveSelectedLeft,
    moveAllLeft,
    isLoading: accessQuery.isLoading,
    isSaving: persistMutation.isPending,
    isError: accessQuery.isError,
    errorMessage,
    controlsDisabled,
    refresh: accessQuery.refetch,
  }
}
