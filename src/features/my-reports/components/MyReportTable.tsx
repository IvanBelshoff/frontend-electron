import clsx from 'clsx'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import FavoriteStarButton from '@/features/my-dashboards/components/FavoriteStarButton'
import MyReportEmptyState from '@/features/my-reports/components/MyReportEmptyState'
import ReportStatusBadges from '@/features/reports/components/ReportStatusBadges'
import type { Report } from '@/features/reports/report-types'

type MyReportTableProps = {
  reports: Report[]
  isFavorite: (reportId: number) => boolean
  togglingFavoriteId: number | null
  onToggleFavorite: (reportId: number) => void
  onOpenReport: (relatorioId: number) => void
  onClearFilters: () => void
}

export default function MyReportTable({
  reports,
  isFavorite,
  togglingFavoriteId,
  onToggleFavorite,
  onOpenReport,
  onClearFilters,
}: MyReportTableProps) {
  if (reports.length === 0) {
    return <MyReportEmptyState onClearFilters={onClearFilters} />
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-vscode-border">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-vscode-border bg-vscode-activity-bar/80">
            <th className="w-14 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Fav.
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Relatório
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Privacidade
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Temporalidade
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              IA
            </th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr
              key={report.id}
              onClick={() => onOpenReport(report.id)}
              className={clsx(
                'cursor-pointer border-b border-vscode-border/70 transition-colors last:border-b-0 hover:bg-vscode-accent/5',
                isFavorite(report.id) && 'bg-amber-400/5',
              )}
            >
              <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                <FavoriteStarButton
                  isFavorite={isFavorite(report.id)}
                  isLoading={togglingFavoriteId === report.id}
                  label={`${isFavorite(report.id) ? 'Remover' : 'Adicionar'} ${report.nome} dos favoritos`}
                  onToggle={() => onToggleFavorite(report.id)}
                  className="h-8 w-8"
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent">
                    <DashboardMaterialIcon name={report.icone} className="text-lg" filled />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-vscode-text">{report.nome}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <ReportStatusBadges report={report} field="privacidade" />
              </td>
              <td className="px-4 py-3">
                <ReportStatusBadges report={report} field="temporario" />
              </td>
              <td className="px-4 py-3">
                <ReportStatusBadges report={report} field="ia" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
