import MyReportCard from '@/features/my-reports/components/MyReportCard'
import MyReportEmptyState from '@/features/my-reports/components/MyReportEmptyState'
import type { Report } from '@/features/reports/report-types'

type MyReportCardGridProps = {
  reports: Report[]
  isFavorite: (reportId: number) => boolean
  togglingFavoriteId: number | null
  onToggleFavorite: (reportId: number) => void
  onOpenReport: (relatorioId: number) => void
  onClearFilters: () => void
}

export default function MyReportCardGrid({
  reports,
  isFavorite,
  togglingFavoriteId,
  onToggleFavorite,
  onOpenReport,
  onClearFilters,
}: MyReportCardGridProps) {
  if (reports.length === 0) {
    return <MyReportEmptyState onClearFilters={onClearFilters} />
  }

  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,20rem),1fr))]">
      {reports.map((report) => (
        <MyReportCard
          key={report.id}
          report={report}
          isFavorite={isFavorite(report.id)}
          isTogglingFavorite={togglingFavoriteId === report.id}
          onToggleFavorite={() => onToggleFavorite(report.id)}
          onOpenReport={onOpenReport}
        />
      ))}
    </div>
  )
}
