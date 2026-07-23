import AuditDiffPanel from '@/features/audit/components/AuditDiffPanel'
import AuditLineDiff from '@/features/audit/components/AuditLineDiff'
import {
  buildSimpleChangePanels,
  buildUnifiedChangeRows,
  inferAuditChangeMode,
} from '@/features/audit/components/audit-line-diff.util'
import type { AuditDiffViewMode } from '@/features/audit/audit-diff-view-mode'
import { getAuditFieldLabel } from '@/features/audit/audit-field-labels'
import type { AuditFieldChange } from '@/features/audit/audit-types'

type AuditChangeDiffProps = {
  action: string
  changes: AuditFieldChange[]
  viewMode: AuditDiffViewMode
}

export default function AuditChangeDiff({ action, changes, viewMode }: AuditChangeDiffProps) {
  if (changes.length === 0) {
    return <p className="text-sm text-vscode-text-muted">Nenhuma alteração registrada.</p>
  }

  const mode = inferAuditChangeMode(action)
  const effectiveViewMode = mode === 'update' ? viewMode : 'simple'

  if (effectiveViewMode === 'simple') {
    const panels = buildSimpleChangePanels(changes, mode, getAuditFieldLabel)
    const hasBefore = panels.before.length > 0
    const hasAfter = panels.after.length > 0

    if (!hasBefore && !hasAfter) {
      return <p className="text-sm text-vscode-text-muted">Nenhuma alteração registrada.</p>
    }

    const showPanelTitles = mode === 'update'

    return (
      <div
        className={
          hasBefore && hasAfter ? 'grid gap-4 md:grid-cols-2' : 'grid gap-4 grid-cols-1'
        }
      >
        <AuditDiffPanel
          title={showPanelTitles ? 'Antes' : undefined}
          variant="remove"
          lines={panels.before}
        />
        <AuditDiffPanel
          title={showPanelTitles ? 'Depois' : undefined}
          variant="add"
          lines={panels.after}
        />
      </div>
    )
  }

  const rows = buildUnifiedChangeRows(changes, mode, getAuditFieldLabel)

  if (rows.length === 0) {
    return <p className="text-sm text-vscode-text-muted">Nenhuma alteração registrada.</p>
  }

  return <AuditLineDiff rows={rows} />
}
