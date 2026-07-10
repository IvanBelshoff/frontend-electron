import ReportCard from '@/features/reports/components/ReportCard'
import ReportEmptyState from '@/features/reports/components/ReportEmptyState'
import type { Report } from '@/features/reports/report-types'

type ReportCardGridProps = {
  reports: Report[]
  onEdit: (report: Report) => void
  onDelete: (report: Report) => void
  onClearFilters: () => void
  canEdit?: boolean
  canDelete?: boolean
}

export default function ReportCardGrid({
  reports,
  onEdit,
  onDelete,
  onClearFilters,
  canEdit = true,
  canDelete = true,
}: ReportCardGridProps) {
  if (reports.length === 0) {
    return <ReportEmptyState onClearFilters={onClearFilters} />
  }

  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]">
      {reports.map((report) => (
        <div key={report.id} className="min-w-0">
          <ReportCard
            report={report}
            onEdit={onEdit}
            onDelete={onDelete}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </div>
      ))}
    </div>
  )
}
