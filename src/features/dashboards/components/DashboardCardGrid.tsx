import DashboardCard from '@/features/dashboards/components/DashboardCard'
import DashboardEmptyState from '@/features/dashboards/components/DashboardEmptyState'
import type { Dashboard } from '@/features/dashboards/dashboard-types'

type DashboardCardGridProps = {
  dashboards: Dashboard[]
  onEdit: (dashboard: Dashboard) => void
  onDelete: (dashboard: Dashboard) => void
  onClearFilters: () => void
  canEdit?: boolean
  canDelete?: boolean
}

export default function DashboardCardGrid({
  dashboards,
  onEdit,
  onDelete,
  onClearFilters,
  canEdit = true,
  canDelete = true,
}: DashboardCardGridProps) {
  if (dashboards.length === 0) {
    return <DashboardEmptyState onClearFilters={onClearFilters} />
  }

  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]">
      {dashboards.map((dashboard) => (
        <div key={dashboard.id} className="min-w-0">
          <DashboardCard
            dashboard={dashboard}
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
