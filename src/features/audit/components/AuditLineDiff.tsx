import clsx from 'clsx'
import type { AuditLineDiffRow } from '@/features/audit/components/audit-line-diff.util'

type AuditLineDiffProps = {
  rows: AuditLineDiffRow[]
  className?: string
}

export default function AuditLineDiff({ rows, className }: AuditLineDiffProps) {
  if (rows.length === 0) {
    return null
  }

  return (
    <div
      className={clsx(
        'overflow-hidden rounded border border-vscode-border bg-vscode-input-bg/40 font-mono text-xs',
        className,
      )}
    >
      {rows.map((row, index) => (
        <div
          key={`${row.type}-${row.lineNumber}-${index}`}
          className={clsx(
            'grid grid-cols-[2.5rem_1rem_1fr] items-start gap-2 px-2 py-0.5',
            row.type === 'remove' && 'bg-red-500/10 text-red-300',
            row.type === 'add' && 'bg-emerald-500/10 text-emerald-300',
            row.type === 'context' && 'text-vscode-text-muted',
          )}
        >
          <span className="select-none text-right text-vscode-text-muted">{row.lineNumber}</span>
          <span className="select-none font-semibold">
            {row.type === 'remove' ? '-' : row.type === 'add' ? '+' : ' '}
          </span>
          <span className="whitespace-pre-wrap break-all">{row.content || ' '}</span>
        </div>
      ))}
    </div>
  )
}
