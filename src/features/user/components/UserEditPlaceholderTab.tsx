type UserEditPlaceholderTabProps = {
  title: string
  description: string
}

export default function UserEditPlaceholderTab({
  title,
  description,
}: UserEditPlaceholderTabProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-vscode-border bg-vscode-sidebar px-6 py-16 text-center">
      <p className="text-sm font-medium text-vscode-text">{title}</p>
      <p className="mt-2 max-w-md text-sm text-vscode-text-muted">{description}</p>
    </div>
  )
}
