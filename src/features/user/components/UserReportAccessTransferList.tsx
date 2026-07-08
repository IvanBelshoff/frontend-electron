import clsx from 'clsx'
import Input from '@/components/ui/Input'
import { DashboardMaterialIcon, SearchIcon } from '@/features/dashboards/icons/DashboardIcons'
import type { AccessReport } from '@/features/user/user-report-access-types'

type UserAccessReportRowProps = {
  report: AccessReport
  selected: boolean
  disabled?: boolean
  isOwner?: boolean
  onToggle: () => void
}

function UserAccessReportRow({
  report,
  selected,
  disabled = false,
  isOwner = false,
  onToggle,
}: UserAccessReportRowProps) {
  return (
    <label
      className={clsx(
        'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
        selected
          ? 'border-vscode-accent/50 bg-vscode-accent/10'
          : 'border-vscode-border bg-vscode-bg/30 hover:border-vscode-accent/30',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <input
        type="checkbox"
        checked={selected}
        disabled={disabled}
        onChange={onToggle}
        className="h-4 w-4 rounded border-vscode-border"
      />
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent">
        <DashboardMaterialIcon name={report.icone} className="text-lg" filled />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-vscode-text">{report.nome}</span>
        {isOwner && (
          <span className="text-xs text-vscode-text-muted">Proprietário — não removível</span>
        )}
      </span>
    </label>
  )
}

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
}

function UserAccessReportColumn({
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
}: UserAccessReportColumnProps) {
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
          disabled={disabled || reports.length === 0}
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
            const isOwner = userId !== undefined && report.idProprietario === userId

            return (
              <UserAccessReportRow
                key={report.id}
                report={report}
                selected={selectedIds.includes(report.id)}
                disabled={disabled || isOwner}
                isOwner={isOwner}
                onToggle={() => onToggleReport(report.id)}
              />
            )
          })
        )}
      </div>
    </section>
  )
}

type UserReportAccessTransferListProps = {
  userId: number
  availableReports: AccessReport[]
  grantedReports: AccessReport[]
  filteredAvailableReports: AccessReport[]
  filteredGrantedReports: AccessReport[]
  selectedAvailableIds: number[]
  selectedGrantedIds: number[]
  availableSearch: string
  grantedSearch: string
  onAvailableSearchChange: (value: string) => void
  onGrantedSearchChange: (value: string) => void
  onToggleAvailableReport: (reportId: number) => void
  onToggleGrantedReport: (reportId: number) => void
  onToggleSelectAllAvailable: () => void
  onToggleSelectAllGranted: () => void
  isAllAvailableSelected: boolean
  isAllGrantedSelected: boolean
  onMoveSelectedRight: () => void
  onMoveAllRight: () => void
  onMoveSelectedLeft: () => void
  onMoveAllLeft: () => void
  disabled?: boolean
}

export default function UserReportAccessTransferList({
  userId,
  availableReports,
  grantedReports,
  filteredAvailableReports,
  filteredGrantedReports,
  selectedAvailableIds,
  selectedGrantedIds,
  availableSearch,
  grantedSearch,
  onAvailableSearchChange,
  onGrantedSearchChange,
  onToggleAvailableReport,
  onToggleGrantedReport,
  onToggleSelectAllAvailable,
  onToggleSelectAllGranted,
  isAllAvailableSelected,
  isAllGrantedSelected,
  onMoveSelectedRight,
  onMoveAllRight,
  onMoveSelectedLeft,
  onMoveAllLeft,
  disabled = false,
}: UserReportAccessTransferListProps) {
  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[1fr_auto_1fr]">
      <UserAccessReportColumn
        title="Disponíveis"
        count={availableReports.length}
        helper="Relatórios privados que o usuário ainda não possui."
        reports={filteredAvailableReports}
        selectedIds={selectedAvailableIds}
        search={availableSearch}
        onSearchChange={onAvailableSearchChange}
        onToggleReport={onToggleAvailableReport}
        onToggleSelectAll={onToggleSelectAllAvailable}
        isAllSelected={isAllAvailableSelected}
        disabled={disabled}
      />

      <div className="flex flex-row items-center justify-center gap-2 lg:flex-col">
        <button
          type="button"
          onClick={onMoveSelectedRight}
          disabled={disabled || selectedAvailableIds.length === 0}
          className="rounded border border-vscode-border px-3 py-2 text-xs hover:border-vscode-accent/40 disabled:opacity-50"
        >
          →
        </button>
        <button
          type="button"
          onClick={onMoveAllRight}
          disabled={disabled || filteredAvailableReports.length === 0}
          className="rounded border border-vscode-border px-3 py-2 text-xs hover:border-vscode-accent/40 disabled:opacity-50"
        >
          ⇒
        </button>
        <button
          type="button"
          onClick={onMoveSelectedLeft}
          disabled={disabled || selectedGrantedIds.length === 0}
          className="rounded border border-vscode-border px-3 py-2 text-xs hover:border-vscode-accent/40 disabled:opacity-50"
        >
          ←
        </button>
        <button
          type="button"
          onClick={onMoveAllLeft}
          disabled={disabled || filteredGrantedReports.length === 0}
          className="rounded border border-vscode-border px-3 py-2 text-xs hover:border-vscode-accent/40 disabled:opacity-50"
        >
          ⇐
        </button>
      </div>

      <UserAccessReportColumn
        title="Com acesso"
        count={grantedReports.length}
        helper="Relatórios privados concedidos a este usuário."
        reports={filteredGrantedReports}
        selectedIds={selectedGrantedIds}
        search={grantedSearch}
        onSearchChange={onGrantedSearchChange}
        onToggleReport={onToggleGrantedReport}
        onToggleSelectAll={onToggleSelectAllGranted}
        isAllSelected={isAllGrantedSelected}
        disabled={disabled}
        userId={userId}
      />
    </div>
  )
}
