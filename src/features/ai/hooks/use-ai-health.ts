import { useQuery } from '@tanstack/react-query'
import { getAiHealth } from '@/features/ai/ai-chat-api'
import { useAuth } from '@/features/auth/use-auth'
import { queryKeys } from '@/lib/query-keys'

export function useAiHealth() {
  const { user } = useAuth()
  const userId = user?.sub ?? null

  const healthQuery = useQuery({
    queryKey: queryKeys.ai.health(userId),
    queryFn: getAiHealth,
    enabled: Boolean(userId),
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  })

  return {
    isLoading: healthQuery.isLoading,
    isChecking: healthQuery.isLoading || healthQuery.isFetching,
    isAvailable: healthQuery.data?.available ?? false,
    health: healthQuery.data,
    refetch: healthQuery.refetch,
  }
}
