import type { ReactNode } from 'react'

type SettingsCardHeaderProps = {
  icon: ReactNode
  title: string
  description: string
  actions?: ReactNode
}

export default function SettingsCardHeader({
  icon,
  title,
  description,
  actions,
}: SettingsCardHeaderProps) {
  return (
    <header className="mb-4 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-vscode-accent/15 text-vscode-accent">
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <strong className="block text-sm font-semibold text-vscode-text">{title}</strong>
        <small className="mt-0.5 block text-xs text-vscode-text-muted">{description}</small>
      </div>

      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </header>
  )
}
