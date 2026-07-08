import type { KeyboardEvent } from 'react'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import FavoriteStarButton from '@/features/my-dashboards/components/FavoriteStarButton'
import ReportStatusBadges from '@/features/reports/components/ReportStatusBadges'
import type { Report } from '@/features/reports/report-types'

type MyReportCardProps = {
  report: Report
  isFavorite: boolean
  isTogglingFavorite: boolean
  onToggleFavorite: () => void
  onOpenReport: (relatorioId: number) => void
}

export default function MyReportCard({
  report,
  isFavorite,
  isTogglingFavorite,
  onToggleFavorite,
  onOpenReport,
}: MyReportCardProps) {
  const openReport = () => {
    onOpenReport(report.id)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openReport()
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openReport}
      onKeyDown={handleKeyDown}
      className="group relative flex min-h-[11rem] cursor-pointer flex-col justify-between rounded-xl border border-vscode-border bg-gradient-to-br from-vscode-sidebar to-vscode-sidebar/70 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-vscode-accent/50 hover:shadow-lg hover:shadow-vscode-accent/10 focus:outline-none focus:ring-2 focus:ring-vscode-accent/40"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-xl bg-gradient-to-r from-vscode-accent/0 via-vscode-accent/70 to-vscode-accent/0 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent shadow-inner">
            <DashboardMaterialIcon name={report.icone} className="text-2xl" filled />
          </span>

          <div className="min-w-0">
            <h3
              className="truncate text-base font-semibold text-vscode-text"
              title={report.nome}
            >
              {report.nome}
            </h3>
          </div>
        </div>

        <FavoriteStarButton
          isFavorite={isFavorite}
          isLoading={isTogglingFavorite}
          label={`${isFavorite ? 'Remover' : 'Adicionar'} ${report.nome} dos favoritos`}
          onToggle={onToggleFavorite}
          className="shrink-0"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ReportStatusBadges report={report} field="privacidade" />
        <ReportStatusBadges report={report} field="temporario" />
      </div>
    </article>
  )
}
