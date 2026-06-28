import clsx from 'clsx'
import { Link, useMatchRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'

type SidebarNavItemProps = {
  to: string
  label: string
  icon: ReactNode
  exact?: boolean
  expanded?: boolean
}

export default function SidebarNavItem({
  to,
  label,
  icon,
  exact = false,
  expanded = true,
}: SidebarNavItemProps) {
  const matchRoute = useMatchRoute()
  const isActive = Boolean(matchRoute({ to, fuzzy: !exact }))

  return (
    <Link
      to={to}
      title={label}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className={clsx(
        'flex items-center rounded border-l-2 text-sm text-vscode-text transition-colors',
        expanded ? 'w-full gap-3 px-3 py-2' : 'mx-auto h-9 w-9 justify-center border-l-0 px-0',
        isActive
          ? clsx(
              'bg-vscode-accent/20 text-vscode-text',
              expanded ? 'border-vscode-accent' : 'ring-1 ring-vscode-accent/40',
            )
          : clsx(
              'border-transparent hover:bg-vscode-activity-bar',
              !expanded && 'hover:ring-1 hover:ring-vscode-border',
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
