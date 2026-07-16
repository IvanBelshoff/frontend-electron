import { useQuery } from '@tanstack/react-query'
import { getAiAccessStatus } from '@/features/ai/ai-chat-api'
import { hasPermission } from '@/features/auth/rbac'
import { AI_RBAC } from '@/features/auth/rbac-requirements'
import { useAuth } from '@/features/auth/use-auth'
import { queryKeys } from '@/lib/query-keys'

export function useAiAccess() {
  const { rbac } = useAuth()
  const hasAiPermission = hasPermission(rbac, AI_RBAC.permission)

  const accessQuery = useQuery({
    queryKey: queryKeys.ai.access,
    queryFn: getAiAccessStatus,
    enabled: hasAiPermission,
    staleTime: 60_000,
  })

  return {
    hasAiPermission,
    access: accessQuery.data,
    isLoading: hasAiPermission && accessQuery.isLoading,
    isEligible: Boolean(accessQuery.data?.eligible),
    refetch: accessQuery.refetch,
  }
}
