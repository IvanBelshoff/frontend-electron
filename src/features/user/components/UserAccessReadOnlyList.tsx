type UserAccessReadOnlyListProps = {
  items: Array<{ id: number; nome: string }>
  emptyMessage: string
}

export default function UserAccessReadOnlyList({
  items,
  emptyMessage,
}: UserAccessReadOnlyListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-vscode-border bg-vscode-bg/30 px-4 py-8 text-center text-sm text-vscode-text-muted">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-md border border-vscode-border bg-vscode-bg/30 px-3 py-2 text-sm text-vscode-text"
        >
          {item.nome}
        </li>
      ))}
    </ul>
  )
}
