import clsx from 'clsx'
import DashboardStatusBadges from '@/features/dashboards/components/DashboardStatusBadges'
import type { Dashboard } from '@/features/dashboards/dashboard-types'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import FavoriteStarButton from '@/features/my-dashboards/components/FavoriteStarButton'
import MyDashboardEmptyState from '@/features/my-dashboards/components/MyDashboardEmptyState'

type MyDashboardTableProps = {
  dashboards: Dashboard[]
  isFavorite: (dashboardId: number) => boolean
  togglingFavoriteId: number | null
  onToggleFavorite: (dashboardId: number) => void
  onOpenDashboard: (dashboardId: number) => void
  onClearFilters: () => void
}

export default function MyDashboardTable({
  dashboards,
  isFavorite,
  togglingFavoriteId,
  onToggleFavorite,
  onOpenDashboard,
  onClearFilters,
}: MyDashboardTableProps) {
  if (dashboards.length === 0) {
    return <MyDashboardEmptyState onClearFilters={onClearFilters} />
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
              Dashboard
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Privacidade
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Temporalidade
            </th>
          </tr>
        </thead>
        <tbody>
          {dashboards.map((dashboard) => (
            <tr
              key={dashboard.id}
              onClick={() => onOpenDashboard(dashboard.id)}
              className={clsx(
                'cursor-pointer border-b border-vscode-border/70 transition-colors last:border-b-0 hover:bg-vscode-accent/5',
                isFavorite(dashboard.id) && 'bg-amber-400/5',
              )}
            >
              <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                <FavoriteStarButton
                  isFavorite={isFavorite(dashboard.id)}
                  isLoading={togglingFavoriteId === dashboard.id}
                  label={`${isFavorite(dashboard.id) ? 'Remover' : 'Adicionar'} ${dashboard.nome} dos favoritos`}
                  onToggle={() => onToggleFavorite(dashboard.id)}
                  className="h-8 w-8"
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent">
                    <DashboardMaterialIcon name={dashboard.icone} className="text-lg" filled />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-vscode-text">{dashboard.nome}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <DashboardStatusBadges dashboard={dashboard} field="privacidade" />
              </td>
              <td className="px-4 py-3">
                <DashboardStatusBadges dashboard={dashboard} field="temporario" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
