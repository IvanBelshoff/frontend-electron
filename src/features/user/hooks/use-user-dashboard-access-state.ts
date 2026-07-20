import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import {
  assignUserDashboards,
  getDashboardsByUser,
} from '@/features/user/user-dashboard-access-api'
import {
  filterAccessDashboardsBySearch,
  isOwnerDashboard,
  sortAccessDashboards,
} from '@/features/user/user-dashboard-access-utils'
import type { AccessDashboard } from '@/features/user/user-dashboard-access-types'
import type { ManagedUser } from '@/features/user/user-list-types'
import { ApiError } from '@/features/auth/auth-types'
import { queryKeys } from '@/lib/query-keys'

type AccessColumn = 'available' | 'granted'

function normalizeLists(available: AccessDashboard[], granted: AccessDashboard[]) {
  return {
    available: sortAccessDashboards(available),
    granted: sortAccessDashboards(granted),
  }
}

export function useUserDashboardAccessState(user: ManagedUser | undefined, enabled: boolean) {
  const queryClient = useQueryClient()
  const userId = user?.id ?? 0
  const isUserBlocked = Boolean(user?.bloqueado)

  const [availableDashboards, setAvailableDashboards] = useState<AccessDashboard[]>([])
  const [grantedDashboards, setGrantedDashboards] = useState<AccessDashboard[]>([])
  const [selectedAvailableIds, setSelectedAvailableIds] = useState<number[]>([])
  const [selectedGrantedIds, setSelectedGrantedIds] = useState<number[]>([])
  const [availableSearch, setAvailableSearch] = useState('')
  const [grantedSearch, setGrantedSearch] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const accessQuery = useQuery({
    queryKey: queryKeys.user.dashboardAccess(userId),
    queryFn: () => getDashboardsByUser(userId),
    enabled: enabled && Number.isFinite(userId) && userId > 0,
  })

  useLayoutEffect(() => {
    if (!accessQuery.data) {
      setAvailableDashboards([])
      setGrantedDashboards([])
      setSelectedAvailableIds([])
      setSelectedGrantedIds([])
      return
    }

    const normalized = normalizeLists(
      accessQuery.data.dashboardsDisponiveis,
      accessQuery.data.dashboards,
    )

    setAvailableDashboards(normalized.available)
    setGrantedDashboards(normalized.granted)
    setSelectedAvailableIds([])
    setSelectedGrantedIds([])
    setErrorMessage(null)
  }, [accessQuery.data, userId])

  useLayoutEffect(() => {
    setAvailableSearch('')
    setGrantedSearch('')
    setErrorMessage(null)
  }, [userId])

  const filteredAvailableDashboards = useMemo(
    () => filterAccessDashboardsBySearch(availableDashboards, availableSearch),
    [availableDashboards, availableSearch],
  )

  const filteredGrantedDashboards = useMemo(
    () => filterAccessDashboardsBySearch(grantedDashboards, grantedSearch),
    [grantedDashboards, grantedSearch],
  )

  const isOwnerDashboardId = useCallback(
    (dashboardId: number) => {
      const dashboard = grantedDashboards.find((item) => item.id === dashboardId)
      return Boolean(dashboard && isOwnerDashboard(dashboard, userId))
    },
    [grantedDashboards, userId],
  )

  const persistMutation = useMutation({
    mutationFn: (dashboardIds: number[]) => assignUserDashboards(userId, dashboardIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) })
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

  const persistGrantedDashboards = useCallback(
    async (nextGranted: AccessDashboard[], nextAvailable: AccessDashboard[]) => {
      const previousGranted = grantedDashboards
      const previousAvailable = availableDashboards

      setGrantedDashboards(sortAccessDashboards(nextGranted))
      setAvailableDashboards(sortAccessDashboards(nextAvailable))
      setSelectedAvailableIds([])
      setSelectedGrantedIds([])

      try {
        await persistMutation.mutateAsync(nextGranted.map((dashboard) => dashboard.id))
      } catch {
        setGrantedDashboards(previousGranted)
        setAvailableDashboards(previousAvailable)
      }
    },
    [availableDashboards, grantedDashboards, persistMutation],
  )

  const toggleDashboardSelection = useCallback(
    (column: AccessColumn, dashboardId: number) => {
      if (column === 'available') {
        setSelectedAvailableIds((current) =>
          current.includes(dashboardId)
            ? current.filter((id) => id !== dashboardId)
            : [...current, dashboardId],
        )
        return
      }

      if (isOwnerDashboardId(dashboardId)) {
        return
      }

      setSelectedGrantedIds((current) =>
        current.includes(dashboardId)
          ? current.filter((id) => id !== dashboardId)
          : [...current, dashboardId],
      )
    },
    [isOwnerDashboardId],
  )

  const toggleSelectAll = useCallback(
    (column: AccessColumn) => {
      if (column === 'available') {
        const filteredIds = filteredAvailableDashboards.map((dashboard) => dashboard.id)
        const allSelected =
          filteredIds.length > 0 &&
          filteredIds.every((id) => selectedAvailableIds.includes(id))

        setSelectedAvailableIds(allSelected ? [] : filteredIds)
        return
      }

      const selectableDashboards = filteredGrantedDashboards.filter(
        (dashboard) => !isOwnerDashboard(dashboard, userId),
      )
      const filteredIds = selectableDashboards.map((dashboard) => dashboard.id)
      const allSelected =
        filteredIds.length > 0 && filteredIds.every((id) => selectedGrantedIds.includes(id))

      setSelectedGrantedIds(allSelected ? [] : filteredIds)
    },
    [
      filteredAvailableDashboards,
      filteredGrantedDashboards,
      selectedAvailableIds,
      selectedGrantedIds,
      userId,
    ],
  )

  const isAllSelected = useCallback(
    (column: AccessColumn) => {
      if (column === 'available') {
        const filteredIds = filteredAvailableDashboards.map((dashboard) => dashboard.id)
        return (
          filteredIds.length > 0 &&
          filteredIds.every((id) => selectedAvailableIds.includes(id))
        )
      }

      const selectableDashboards = filteredGrantedDashboards.filter(
        (dashboard) => !isOwnerDashboard(dashboard, userId),
      )
      const filteredIds = selectableDashboards.map((dashboard) => dashboard.id)
      return (
        filteredIds.length > 0 && filteredIds.every((id) => selectedGrantedIds.includes(id))
      )
    },
    [
      filteredAvailableDashboards,
      filteredGrantedDashboards,
      selectedAvailableIds,
      selectedGrantedIds,
      userId,
    ],
  )

  const moveSelectedRight = useCallback(async () => {
    if (selectedAvailableIds.length === 0) {
      return
    }

    const movingDashboards = availableDashboards.filter((dashboard) =>
      selectedAvailableIds.includes(dashboard.id),
    )

    await persistGrantedDashboards(
      [...grantedDashboards, ...movingDashboards],
      availableDashboards.filter((dashboard) => !selectedAvailableIds.includes(dashboard.id)),
    )
  }, [
    availableDashboards,
    grantedDashboards,
    persistGrantedDashboards,
    selectedAvailableIds,
  ])

  const moveAllRight = useCallback(async () => {
    if (filteredAvailableDashboards.length === 0) {
      return
    }

    const movingIds = new Set(filteredAvailableDashboards.map((dashboard) => dashboard.id))

    await persistGrantedDashboards(
      [...grantedDashboards, ...filteredAvailableDashboards],
      availableDashboards.filter((dashboard) => !movingIds.has(dashboard.id)),
    )
  }, [availableDashboards, filteredAvailableDashboards, grantedDashboards, persistGrantedDashboards])

  const moveSelectedLeft = useCallback(async () => {
    if (selectedGrantedIds.length === 0) {
      return
    }

    const movingDashboards = grantedDashboards.filter((dashboard) =>
      selectedGrantedIds.includes(dashboard.id),
    )

    await persistGrantedDashboards(
      grantedDashboards.filter((dashboard) => !selectedGrantedIds.includes(dashboard.id)),
      [...availableDashboards, ...movingDashboards],
    )
  }, [availableDashboards, grantedDashboards, persistGrantedDashboards, selectedGrantedIds])

  const moveAllLeft = useCallback(async () => {
    const removableDashboards = filteredGrantedDashboards.filter(
      (dashboard) => !isOwnerDashboard(dashboard, userId),
    )

    if (removableDashboards.length === 0) {
      return
    }

    const movingIds = new Set(removableDashboards.map((dashboard) => dashboard.id))

    await persistGrantedDashboards(
      grantedDashboards.filter((dashboard) => !movingIds.has(dashboard.id)),
      [...availableDashboards, ...removableDashboards],
    )
  }, [
    availableDashboards,
    filteredGrantedDashboards,
    grantedDashboards,
    persistGrantedDashboards,
    userId,
  ])

  const controlsDisabled =
    isUserBlocked ||
    (accessQuery.isLoading && !accessQuery.data) ||
    persistMutation.isPending

  return {
    availableDashboards,
    grantedDashboards,
    filteredAvailableDashboards,
    filteredGrantedDashboards,
    selectedAvailableIds,
    selectedGrantedIds,
    availableSearch,
    setAvailableSearch,
    grantedSearch,
    setGrantedSearch,
    toggleDashboardSelection,
    toggleSelectAll,
    isAllSelected,
    moveSelectedRight,
    moveAllRight,
    moveSelectedLeft,
    moveAllLeft,
    isLoading: accessQuery.isLoading,
    isSaving: persistMutation.isPending,
    isError: accessQuery.isError,
    loadError: accessQuery.error,
    errorMessage,
    controlsDisabled,
    isUserBlocked,
    isOwnerDashboardId,
    refresh: accessQuery.refetch,
  }
}
