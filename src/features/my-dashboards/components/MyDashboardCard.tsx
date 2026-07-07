import type { KeyboardEvent } from 'react'
import DashboardStatusBadges from '@/features/dashboards/components/DashboardStatusBadges'
import type { Dashboard } from '@/features/dashboards/dashboard-types'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import FavoriteStarButton from '@/features/my-dashboards/components/FavoriteStarButton'

type MyDashboardCardProps = {
  dashboard: Dashboard
  isFavorite: boolean
  isTogglingFavorite: boolean
  onToggleFavorite: () => void
  onOpenDashboard: (dashboardId: number) => void
}

export default function MyDashboardCard({
  dashboard,
  isFavorite,
  isTogglingFavorite,
  onToggleFavorite,
  onOpenDashboard,
}: MyDashboardCardProps) {
  const openDashboard = () => {
    onOpenDashboard(dashboard.id)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openDashboard()
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openDashboard}
      onKeyDown={handleKeyDown}
      className="group relative flex min-h-[11rem] cursor-pointer flex-col justify-between rounded-xl border border-vscode-border bg-gradient-to-br from-vscode-sidebar to-vscode-sidebar/70 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-vscode-accent/50 hover:shadow-lg hover:shadow-vscode-accent/10 focus:outline-none focus:ring-2 focus:ring-vscode-accent/40"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-xl bg-gradient-to-r from-vscode-accent/0 via-vscode-accent/70 to-vscode-accent/0 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent shadow-inner">
            <DashboardMaterialIcon name={dashboard.icone} className="text-2xl" filled />
          </span>

          <div className="min-w-0">
            <h3
              className="truncate text-base font-semibold text-vscode-text"
              title={dashboard.nome}
            >
              {dashboard.nome}
            </h3>
          </div>
        </div>

        <FavoriteStarButton
          isFavorite={isFavorite}
          isLoading={isTogglingFavorite}
          label={`${isFavorite ? 'Remover' : 'Adicionar'} ${dashboard.nome} dos favoritos`}
          onToggle={onToggleFavorite}
          className="shrink-0"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <DashboardStatusBadges dashboard={dashboard} field="privacidade" />
        <DashboardStatusBadges dashboard={dashboard} field="temporario" />
      </div>
    </article>
  )
}
