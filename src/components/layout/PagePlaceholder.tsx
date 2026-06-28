type PagePlaceholderProps = {
  title: string
  description: string
}

export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="rounded border border-vscode-border bg-vscode-sidebar p-6">
      <h2 className="text-lg font-semibold text-vscode-text">{title}</h2>
      <p className="mt-2 text-sm text-vscode-text-muted">{description}</p>
    </section>
  )
}
