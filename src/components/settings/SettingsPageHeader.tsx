type SettingsPageHeaderProps = {
  title: string
  subtitle?: string
}

export default function SettingsPageHeader({ title, subtitle }: SettingsPageHeaderProps) {
  return (
    <header>
      <h1 className="text-2xl font-semibold text-vscode-text">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-vscode-text-muted">{subtitle}</p>}
    </header>
  )
}
