import clsx from 'clsx'
import type { ReactNode } from 'react'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

type BadgeProps = {
  variant?: BadgeVariant
  icon?: ReactNode
  children: ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  danger: 'border-red-500/30 bg-red-500/10 text-red-400',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
  neutral: 'border-vscode-border bg-vscode-input-bg/50 text-vscode-text-muted',
}

export default function Badge({
  variant = 'neutral',
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {icon && <span className="shrink-0 [&>svg]:h-3 [&>svg]:w-3">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
