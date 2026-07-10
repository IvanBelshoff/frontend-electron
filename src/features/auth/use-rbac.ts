import { useAuth } from '@/features/auth/use-auth'
import type { UserRbac } from '@/features/auth/rbac-types'

export function useRbac(): UserRbac | null {
  const { rbac } = useAuth()
  return rbac
}
