import MyDashboardCard from '@/features/my-dashboards/components/MyDashboardCard'
import MyDashboardEmptyState from '@/features/my-dashboards/components/MyDashboardEmptyState'
import type { Dashboard } from '@/features/dashboards/dashboard-types'

type MyDashboardCardGridProps = {
  dashboards: Dashboard[]
  isFavorite: (dashboardId: number) => boolean
  togglingFavoriteId: number | null
  onToggleFavorite: (dashboardId: number) => void
  onOpenDashboard: (dashboardId: number) => void
  onClearFilters: () => void
}

export default function MyDashboardCardGrid({
  dashboards,
  isFavorite,
  togglingFavoriteId,
  onToggleFavorite,
  onOpenDashboard,
  onClearFilters,
}: MyDashboardCardGridProps) {
  if (dashboards.length === 0) {
    return <MyDashboardEmptyState onClearFilters={onClearFilters} />
  }

  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,20rem),1fr))]">
      {dashboards.map((dashboard) => (
        <MyDashboardCard
          key={dashboard.id}
          dashboard={dashboard}
          isFavorite={isFavorite(dashboard.id)}
          isTogglingFavorite={togglingFavoriteId === dashboard.id}
          onToggleFavorite={() => onToggleFavorite(dashboard.id)}
          onOpenDashboard={onOpenDashboard}
        />
      ))}
    </div>
  )
}
