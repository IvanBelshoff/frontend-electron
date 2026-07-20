import clsx from 'clsx'
import AccessOwnerBadge from '@/components/access/AccessOwnerBadge'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import type { AccessReport } from '@/features/user/user-report-access-types'

type UserAccessReportRowProps = {
  report: AccessReport
  selected: boolean
  selectionDisabled?: boolean
  iaDisabled?: boolean
  isOwner?: boolean
  showAiKnowledge?: boolean
  onToggleAiKnowledge?: () => void
  onToggle: () => void
}

export default function UserAccessReportRow({
  report,
  selected,
  selectionDisabled = false,
  iaDisabled = false,
  isOwner = false,
  showAiKnowledge = false,
  onToggleAiKnowledge,
  onToggle,
}: UserAccessReportRowProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-md border px-3 py-2 transition-colors',
        selected
          ? 'border-vscode-accent bg-vscode-accent/10'
          : 'border-vscode-border bg-vscode-bg/40 hover:border-vscode-accent/40',
      )}
    >
      <label
        className={clsx(
          'flex min-w-0 flex-1 cursor-pointer items-center gap-3',
          selectionDisabled && 'cursor-not-allowed opacity-70',
        )}
      >
        <input
          type="checkbox"
          checked={selected}
          disabled={selectionDisabled}
          onChange={onToggle}
          className="h-4 w-4 rounded border-vscode-border accent-vscode-accent"
        />

        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent">
          <DashboardMaterialIcon name={report.icone} className="text-[1.15rem]" filled />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-vscode-text">{report.nome}</span>
          {isOwner && <AccessOwnerBadge />}
        </span>
      </label>

      {showAiKnowledge && onToggleAiKnowledge && (
        <button
          type="button"
          title="Permitir conhecimento da IA"
          disabled={iaDisabled}
          onClick={(event) => {
            event.stopPropagation()
            onToggleAiKnowledge()
          }}
          className={clsx(
            'shrink-0 rounded border px-2 py-1 text-[10px] font-medium uppercase tracking-wide transition-colors',
            report.permitirConhecimentoIa
              ? 'border-vscode-accent/50 bg-vscode-accent/15 text-vscode-accent'
              : 'border-vscode-border text-vscode-text-muted hover:border-vscode-accent/40 hover:text-vscode-text',
            iaDisabled && 'cursor-not-allowed opacity-60',
          )}
        >
          IA
        </button>
      )}
    </div>
  )
}
