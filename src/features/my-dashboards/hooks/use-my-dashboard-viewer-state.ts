import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/use-auth'
import { ApiError } from '@/features/auth/auth-types'
import type { MyDashboardListResult } from '@/features/my-dashboards/my-dashboard-types'
import {
  getMyDashboard,
  updateMyDashboardFavorites,
} from '@/features/my-dashboards/my-dashboard-api'
import { queryKeys } from '@/lib/query-keys'

function readFavoriteIdsFromCache(
  queryClient: ReturnType<typeof useQueryClient>,
): number[] {
  const cachedEntries = queryClient.getQueriesData<MyDashboardListResult>({
    queryKey: ['my-dashboards', 'list'],
  })

  for (const [, data] of cachedEntries) {
    if (data?.favoriteIds?.length) {
      return data.favoriteIds
    }
  }

  return []
}

export function useMyDashboardViewerState(dashboardId: number) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.sub ?? 0

  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() =>
    readFavoriteIdsFromCache(queryClient),
  )
  const [favoriteError, setFavoriteError] = useState<string | null>(null)
  const [togglingFavorite, setTogglingFavorite] = useState(false)

  const dashboardQuery = useQuery({
    queryKey: queryKeys.myDashboards.detail(dashboardId),
    queryFn: () => getMyDashboard(dashboardId),
    enabled: Number.isFinite(dashboardId) && dashboardId > 0,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.statusCode === 403 || error.statusCode === 404)) {
        return false
      }

      return failureCount < 2
    },
  })

  useEffect(() => {
    const cachedFavoriteIds = readFavoriteIdsFromCache(queryClient)

    if (cachedFavoriteIds.length > 0) {
      setFavoriteIds(cachedFavoriteIds)
    }
  }, [queryClient])

  const isFavorite = favoriteIds.includes(dashboardId)

  const favoriteMutation = useMutation({
    mutationFn: (nextFavoriteIds: number[]) => {
      if (!userId) {
        throw new Error('Usuário não autenticado.')
      }

      return updateMyDashboardFavorites(userId, nextFavoriteIds)
    },
    onMutate: async (nextFavoriteIds) => {
      setFavoriteError(null)
      const previousFavoriteIds = favoriteIds
      setFavoriteIds(nextFavoriteIds)
      return { previousFavoriteIds }
    },
    onError: (error, _nextFavoriteIds, context) => {
      if (context?.previousFavoriteIds) {
        setFavoriteIds(context.previousFavoriteIds)
      }

      setFavoriteError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Não foi possível atualizar os favoritos.',
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-dashboards', 'list'] })
    },
    onSettled: () => {
      setTogglingFavorite(false)
    },
  })

  const toggleFavorite = useCallback(() => {
    if (!userId || favoriteMutation.isPending) {
      return
    }

    setTogglingFavorite(true)
    const nextFavoriteIds = isFavorite
      ? favoriteIds.filter((id) => id !== dashboardId)
      : [...favoriteIds, dashboardId]

    void favoriteMutation.mutateAsync(nextFavoriteIds)
  }, [dashboardId, favoriteIds, favoriteMutation, isFavorite, userId])

  const openInfoDrawer = useCallback(() => {
    setIsInfoDrawerOpen(true)
  }, [])

  const closeInfoDrawer = useCallback(() => {
    setIsInfoDrawerOpen(false)
  }, [])

  const toggleInfoDrawer = useCallback(() => {
    setIsInfoDrawerOpen((current) => !current)
  }, [])

  return {
    dashboard: dashboardQuery.data ?? null,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    isInfoDrawerOpen,
    openInfoDrawer,
    closeInfoDrawer,
    toggleInfoDrawer,
    isFavorite,
    toggleFavorite,
    isTogglingFavorite: togglingFavorite,
    favoriteError,
  }
}
