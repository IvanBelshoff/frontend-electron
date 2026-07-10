import type { ReactElement, ReactNode } from 'react'
import { cloneElement, isValidElement } from 'react'
import { hasPermission, hasRole } from '@/features/auth/rbac'
import { useRbac } from '@/features/auth/use-rbac'

type PermissionGateMode = 'hide' | 'disable'

type PermissionGateProps = {
  children: ReactNode
  mode?: PermissionGateMode
  permission?: string
  role?: string
  fallback?: ReactNode
}

export default function PermissionGate({
  children,
  mode = 'disable',
  permission,
  role,
  fallback = null,
}: PermissionGateProps) {
  const rbac = useRbac()

  const allowed = permission
    ? hasPermission(rbac, permission)
    : role
      ? hasRole(rbac, role)
      : true

  if (allowed) {
    return <>{children}</>
  }

  if (mode === 'hide') {
    return <>{fallback}</>
  }

  if (isValidElement(children)) {
    return cloneElement(children as ReactElement<{ disabled?: boolean; title?: string }>, {
      disabled: true,
      title: 'Você não possui permissão para esta ação.',
    })
  }

  return <>{fallback}</>
}
