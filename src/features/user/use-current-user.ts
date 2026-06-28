import { useQuery } from '@tanstack/react-query'
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

export function getUserPhotoUrl(userId: number): string {
  return `${getApiUrl()}/user/${userId}/foto`
}
