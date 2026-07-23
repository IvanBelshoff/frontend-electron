import clsx from 'clsx'
import type { AuditDiffViewMode } from '@/features/audit/audit-diff-view-mode'

type AuditDiffViewToggleProps = {
  value: AuditDiffViewMode
  onChange: (mode: AuditDiffViewMode) => void
}

export default function AuditDiffViewToggle({ value, onChange }: AuditDiffViewToggleProps) {
  return (
    <div
      className="inline-flex rounded-md border border-vscode-border bg-vscode-input-bg/50 p-0.5"
      role="group"
      aria-label="Modo de visualização das alterações"
    >
      <button
        type="button"
        onClick={() => onChange('simple')}
        className={clsx(
          'rounded px-2.5 py-1 text-xs font-medium transition-colors',
          value === 'simple'
            ? 'border border-vscode-accent bg-vscode-accent/10 text-vscode-text'
            : 'border border-transparent text-vscode-text-muted hover:text-vscode-text',
        )}
      >
        Simples
      </button>
      <button
        type="button"
        onClick={() => onChange('dev')}
        className={clsx(
          'rounded px-2.5 py-1 text-xs font-medium transition-colors',
          value === 'dev'
            ? 'border border-vscode-accent bg-vscode-accent/10 text-vscode-text'
            : 'border border-transparent text-vscode-text-muted hover:text-vscode-text',
        )}
      >
        Dev
      </button>
    </div>
  )
}
