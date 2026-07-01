type DashboardEditPlaceholderTabProps = {
  title: string
}

export default function DashboardEditPlaceholderTab({ title }: DashboardEditPlaceholderTabProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-vscode-border bg-vscode-sidebar px-6 py-16 text-center">
      <p className="text-sm font-medium text-vscode-text">{title}</p>
      <p className="mt-2 text-sm text-vscode-text-muted">Em breve.</p>
    </div>
  )
}
