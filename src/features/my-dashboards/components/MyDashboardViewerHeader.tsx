import { Link } from '@tanstack/react-router'
import { InfoIcon } from '@/components/settings/SettingsIcons'
import IconButton from '@/components/ui/IconButton'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import FavoriteStarButton from '@/features/my-dashboards/components/FavoriteStarButton'

type MyDashboardViewerHeaderProps = {
  dashboardName: string
  dashboardIcon: string
  isFavorite: boolean
  isTogglingFavorite: boolean
  isInfoDrawerOpen: boolean
  onToggleFavorite: () => void
  onToggleInfoDrawer: () => void
}

function BackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

export default function MyDashboardViewerHeader({
  dashboardName,
  dashboardIcon,
  isFavorite,
  isTogglingFavorite,
  isInfoDrawerOpen,
  onToggleFavorite,
  onToggleInfoDrawer,
}: MyDashboardViewerHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          to="/"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-vscode-border text-vscode-text-muted transition-colors hover:border-vscode-accent/40 hover:bg-vscode-accent/10 hover:text-vscode-accent"
          aria-label="Voltar para Meus Dashboards"
          title="Voltar para Meus Dashboards"
        >
          <BackIcon />
        </Link>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent">
          <DashboardMaterialIcon name={dashboardIcon} className="text-xl" filled />
        </span>

        <h1 className="truncate text-lg font-semibold text-vscode-text" title={dashboardName}>
          {dashboardName}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <IconButton
          icon={<InfoIcon />}
          label={isInfoDrawerOpen ? 'Fechar informações' : 'Abrir informações'}
          title={isInfoDrawerOpen ? 'Fechar informações' : 'Abrir informações'}
          onClick={onToggleInfoDrawer}
          className="h-9 w-9 rounded-full border border-vscode-border text-sky-400 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-300"
        />

        <FavoriteStarButton
          isFavorite={isFavorite}
          isLoading={isTogglingFavorite}
          label={`${isFavorite ? 'Remover' : 'Adicionar'} ${dashboardName} dos favoritos`}
          onToggle={onToggleFavorite}
        />
      </div>
    </header>
  )
}
