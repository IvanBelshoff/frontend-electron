import { useQuery, type QueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/use-auth'
import { getApiUrl } from '@/lib/config'
import { queryKeys } from '@/lib/query-keys'
import { getUserById } from './user-api'

export function useCurrentUser() {
  const { user } = useAuth()

  return useQuery({
    queryKey: queryKeys.user.detail(user?.sub),
    queryFn: () => getUserById(user!.sub),
    enabled: Boolean(user?.sub),
  })
}

export function useUserPhotoVersion(userId?: number) {
  return useQuery({
    queryKey: queryKeys.user.photoVersion(userId),
    queryFn: () => 0,
    enabled: Boolean(userId),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function bumpUserPhotoVersion(queryClient: QueryClient, userId: number) {
  queryClient.setQueryData(queryKeys.user.photoVersion(userId), Date.now())
}

export function getUserPhotoUrl(userId: number): string {
  return `${getApiUrl()}/user/${userId}/foto`
}
