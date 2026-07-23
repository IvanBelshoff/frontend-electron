import clsx from 'clsx'

type AuditDiffPanelProps = {
  title?: string
  variant: 'remove' | 'add'
  lines: string[]
}

export default function AuditDiffPanel({ title, variant, lines }: AuditDiffPanelProps) {
  if (lines.length === 0) {
    return null
  }

  return (
    <div className="min-w-0 space-y-1">
      {title ? <h5 className="text-xs font-medium text-vscode-text-muted">{title}</h5> : null}
      <div className="overflow-hidden rounded border border-vscode-border bg-vscode-input-bg/40 font-mono text-xs">
        {lines.map((line, index) => (
          <div
            key={`${title ?? variant}-${index}`}
            className={clsx(
              'grid grid-cols-[2.5rem_1fr] items-start gap-2 px-2 py-0.5',
              variant === 'remove' && 'bg-red-500/10 text-red-300',
              variant === 'add' && 'bg-emerald-500/10 text-emerald-300',
            )}
          >
            <span className="select-none text-right text-vscode-text-muted">{index + 1}</span>
            <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
