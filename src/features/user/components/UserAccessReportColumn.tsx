import clsx from 'clsx'
import Input from '@/components/ui/Input'
import UserAccessReportRow from '@/features/user/components/UserAccessReportRow'
import { isOwnerReport } from '@/features/user/user-report-access-utils'
import type { AccessReport } from '@/features/user/user-report-access-types'
import { SearchIcon } from '@/features/dashboards/icons/DashboardIcons'

type UserAccessReportColumnProps = {
  title: string
  count: number
  helper: string
  reports: AccessReport[]
  selectedIds: number[]
  search: string
  onSearchChange: (value: string) => void
  onToggleReport: (reportId: number) => void
  onToggleSelectAll: () => void
  isAllSelected: boolean
  disabled?: boolean
  userId?: number
  showAiKnowledge?: boolean
  onToggleAiKnowledge?: (reportId: number) => void
}

export default function UserAccessReportColumn({
  title,
  count,
  helper,
  reports,
  selectedIds,
  search,
  onSearchChange,
  onToggleReport,
  onToggleSelectAll,
  isAllSelected,
  disabled = false,
  userId,
  showAiKnowledge = false,
  onToggleAiKnowledge,
}: UserAccessReportColumnProps) {
  const selectableCount =
    userId !== undefined
      ? reports.filter((report) => !isOwnerReport(report, userId)).length
      : reports.length
  const selectAllDisabled = disabled || selectableCount === 0

  return (
    <section className="flex h-full min-h-0 flex-col rounded-lg border border-vscode-border bg-vscode-sidebar/60 p-4">
      <div className="mb-3 flex shrink-0 items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <strong className="text-sm text-vscode-text">{title}</strong>
            <span className="rounded-full border border-vscode-border px-2 py-0.5 text-xs text-vscode-text-muted">
              {count}
            </span>
          </div>
          <p className="mt-1 text-xs text-vscode-text-muted">{helper}</p>
        </div>

        <button
          type="button"
          onClick={onToggleSelectAll}
          disabled={selectAllDisabled}
          className={clsx(
            'shrink-0 rounded border px-2.5 py-1 text-xs font-medium transition-colors',
            'border-vscode-border text-vscode-text-muted hover:border-vscode-accent/40 hover:text-vscode-text',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {isAllSelected ? 'Limpar seleção' : 'Selecionar todos'}
        </button>
      </div>

      <div className="relative mb-3 shrink-0">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-vscode-text-muted">
          <SearchIcon />
        </span>
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Pesquisar por nome do relatório"
          disabled={disabled}
          className="pl-9"
        />
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {reports.length === 0 ? (
          <p className="py-8 text-center text-sm text-vscode-text-muted">
            Nenhum relatório encontrado.
          </p>
        ) : (
          reports.map((report) => {
            const isOwner = userId !== undefined && isOwnerReport(report, userId)

            return (
              <UserAccessReportRow
                key={report.id}
                report={report}
                selected={selectedIds.includes(report.id)}
                selectionDisabled={disabled || isOwner}
                iaDisabled={disabled}
                isOwner={isOwner}
                showAiKnowledge={showAiKnowledge}
                onToggleAiKnowledge={
                  onToggleAiKnowledge ? () => onToggleAiKnowledge(report.id) : undefined
                }
                onToggle={() => onToggleReport(report.id)}
              />
            )
          })
        )}
      </div>
    </section>
  )
}
