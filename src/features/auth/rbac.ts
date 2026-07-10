import type { UserRbac } from './rbac-types'

export const ADMIN_ROLE = 'REGRA_ADMIN'

export function isAdmin(rbac: UserRbac | null): boolean {
  return Boolean(rbac?.regras.includes(ADMIN_ROLE))
}

export function hasRole(rbac: UserRbac | null, role: string): boolean {
  if (!rbac) {
    return false
  }

  if (isAdmin(rbac)) {
    return true
  }

  return rbac.regras.includes(role)
}

export function hasPermission(rbac: UserRbac | null, permission: string): boolean {
  if (!rbac) {
    return false
  }

  if (isAdmin(rbac)) {
    return true
  }

  return rbac.permissoes.includes(permission)
}

export function hasAnyPermission(rbac: UserRbac | null, permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(rbac, permission))
}

export function hasAllPermissions(rbac: UserRbac | null, permissions: string[]): boolean {
  return permissions.every((permission) => hasPermission(rbac, permission))
}

export function canChangeUserPassword(
  rbac: UserRbac | null,
  currentUserId: number | undefined,
  targetUserId: number,
): boolean {
  return isAdmin(rbac) || currentUserId === targetUserId
}

export function toUserRbac(regras: string[], permissoes: string[]): UserRbac {
  return { regras, permissoes }
}
