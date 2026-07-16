export type SettingsInfoItem = {
  label: string
  value: string
}

type SettingsInfoGridProps = {
  items: SettingsInfoItem[]
}

export default function SettingsInfoGrid({ items }: SettingsInfoGridProps) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      role="list"
      aria-label="Informações do sistema"
    >
      {items.map((item) => (
        <div
          key={item.label}
          role="listitem"
          className="rounded-md border border-vscode-border bg-vscode-bg/40 px-4 py-3"
        >
          <span className="block text-xs text-vscode-text-muted">{item.label}</span>
          <strong className="mt-1 block text-sm font-medium text-vscode-text">{item.value}</strong>
        </div>
      ))}
    </div>
  )
}
