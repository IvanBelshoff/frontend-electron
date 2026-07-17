import { useQuery } from '@tanstack/react-query'
import { getAiAccessStatus } from '@/features/ai/ai-chat-api'
import { hasRole } from '@/features/auth/rbac'
import { AI_RBAC } from '@/features/auth/rbac-requirements'
import { useAuth } from '@/features/auth/use-auth'
import { queryKeys } from '@/lib/query-keys'

export function useAiAccess() {
  const { rbac } = useAuth()
  const hasAiRole = hasRole(rbac, AI_RBAC.menuRole)

  const accessQuery = useQuery({
    queryKey: queryKeys.ai.access,
    queryFn: getAiAccessStatus,
    enabled: hasAiRole,
    staleTime: 60_000,
  })

  return {
    hasAiRole,
    access: accessQuery.data,
    isLoading: hasAiRole && accessQuery.isLoading,
    isEligible: Boolean(accessQuery.data?.eligible),
    refetch: accessQuery.refetch,
  }
}
