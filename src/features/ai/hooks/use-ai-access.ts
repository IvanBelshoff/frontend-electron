import { useQuery } from '@tanstack/react-query'
import { getAiAccessStatus } from '@/features/ai/ai-chat-api'
import { hasRole, isAdmin } from '@/features/auth/rbac'
import { AI_RBAC } from '@/features/auth/rbac-requirements'
import { useAuth } from '@/features/auth/use-auth'
import { queryKeys } from '@/lib/query-keys'

export function useAiAccess() {
  const { rbac, user } = useAuth()
  const userId = user?.sub ?? null
  const hasAiRole = hasRole(rbac, AI_RBAC.menuRole)
  const adminUser = isAdmin(rbac)

  const accessQuery = useQuery({
    queryKey: queryKeys.ai.access(userId),
    queryFn: getAiAccessStatus,
    enabled: Boolean(userId) && hasAiRole,
    staleTime: 60_000,
  })

  // Admin is always eligible on the backend; keep the nav visible while access loads.
  const isEligible = adminUser || Boolean(accessQuery.data?.eligible)
  const canAccessAiAssistant = hasAiRole && isEligible

  return {
    hasAiRole,
    access: accessQuery.data,
    isLoading: hasAiRole && accessQuery.isLoading,
    isEligible,
    canAccessAiAssistant,
    refetch: accessQuery.refetch,
  }
}
