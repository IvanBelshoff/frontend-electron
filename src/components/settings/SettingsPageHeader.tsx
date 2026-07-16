import type { ReactNode } from 'react'

type SettingsPageHeaderProps = {
  title: string
  subtitle?: string
  titleAddon?: ReactNode
  actions?: ReactNode
}

export default function SettingsPageHeader({
  title,
  subtitle,
  titleAddon,
  actions,
}: SettingsPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-vscode-text">{title}</h1>
          {titleAddon}
        </div>
        {subtitle && <p className="mt-1 text-sm text-vscode-text-muted">{subtitle}</p>}
      </div>
      {actions}
    </header>
  )
}
