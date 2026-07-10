import { redirect } from '@tanstack/react-router'
import { authStore } from '@/features/auth/auth-store'
import { hasPermission, hasRole } from '@/features/auth/rbac'

export function requireRole(role: string, redirectTo = '/') {
  const rbac = authStore.getRbac()

  if (!hasRole(rbac, role)) {
    throw redirect({ to: redirectTo })
  }
}

export function requirePermission(permission: string, redirectTo = '/') {
  const rbac = authStore.getRbac()

  if (!hasPermission(rbac, permission)) {
    throw redirect({ to: redirectTo })
  }
}
