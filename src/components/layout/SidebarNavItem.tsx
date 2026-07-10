import clsx from 'clsx'
import { Link, useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import {
  isSidebarNavActive,
  type SidebarNavMatchPattern,
} from '@/components/layout/sidebar-nav-utils'

type SidebarNavItemProps = {
  to: string
  label: string
  icon: ReactNode
  exact?: boolean
  expanded?: boolean
  alsoActiveOn?: SidebarNavMatchPattern[]
}

export default function SidebarNavItem({
  to,
  label,
  icon,
  exact = false,
  expanded = true,
  alsoActiveOn,
}: SidebarNavItemProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isActive = isSidebarNavActive(pathname, { to, exact, alsoActiveOn })
  return (
    <Link
      to={to}
      title={label}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className={clsx(
        'flex items-center rounded text-sm text-vscode-text transition-colors',
        expanded
          ? 'w-full gap-3 border-l-2 px-3 py-2'
          : 'mx-auto h-9 w-9 justify-center border px-0',
        isActive
          ? clsx('bg-vscode-accent/20 text-vscode-text', 'border-vscode-accent')
          : clsx(
              'border-transparent hover:bg-vscode-activity-bar',
              !expanded && 'hover:border-vscode-border',
            ),
      )}
    >
      <span
        className={clsx(
          'flex shrink-0 items-center justify-center',
          isActive ? 'text-vscode-accent' : 'text-vscode-text-muted',
          expanded ? 'h-5 w-5' : 'h-4 w-4',
        )}
      >
        {icon}
      </span>
      {expanded && <span className="truncate">{label}</span>}
    </Link>
  )
}
