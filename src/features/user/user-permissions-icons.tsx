import type { ReactNode } from 'react'
import {
  EyeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@/features/dashboards/icons/DashboardIcons'
import { KeyIcon, ShieldIcon } from '@/features/user/components/UserIcons'

type IconProps = {
  className?: string
}

function ChartLineIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  )
}

function UsersGroupIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function UserIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function AtIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
    </svg>
  )
}

export function resolveRuleIcon(ruleName: string, className?: string): ReactNode {
  const normalizedRuleName = ruleName.toUpperCase()

  if (normalizedRuleName.includes('ADMIN')) {
    return <ShieldIcon className={className} />
  }

  if (normalizedRuleName.includes('DASHBOARD')) {
    return <ChartLineIcon className={className} />
  }

  if (normalizedRuleName.includes('USUARIO')) {
    return <UsersGroupIcon className={className} />
  }

  return <KeyIcon className={className} />
}

export function resolvePermissionIcon(permissionName: string, className?: string): ReactNode {
  const normalizedPermissionName = permissionName.toUpperCase()

  if (normalizedPermissionName.includes('CRIAR')) {
    return <PlusIcon className={className} />
  }

  if (
    normalizedPermissionName.includes('ATUALIZAR') ||
    normalizedPermissionName.includes('EDITAR')
  ) {
    return <PencilIcon className={className} />
  }

  if (
    normalizedPermissionName.includes('DELETAR') ||
    normalizedPermissionName.includes('EXCLUIR')
  ) {
    return <TrashIcon className={className} />
  }

  if (
    normalizedPermissionName.includes('VISUALIZAR') ||
    normalizedPermissionName.includes('LISTAR') ||
    normalizedPermissionName.includes('VER')
  ) {
    return <EyeIcon className={className} />
  }

  if (
    normalizedPermissionName.includes('CONCEDER') ||
    normalizedPermissionName.includes('GERENCIAR')
  ) {
    return <AtIcon className={className} />
  }

  if (normalizedPermissionName.includes('DASHBOARD')) {
    return <ChartLineIcon className={className} />
  }

  if (normalizedPermissionName.includes('USUARIO')) {
    return <UserIcon className={className} />
  }

  return <KeyIcon className={className} />
}
