import { Link, useParams } from '@tanstack/react-router'
import Alert from '@/components/ui/Alert'
import { ApiError } from '@/features/auth/auth-types'
import DashboardViewerFrame from '@/features/my-dashboards/components/DashboardViewerFrame'
import MyDashboardInfoDrawer from '@/features/my-dashboards/components/MyDashboardInfoDrawer'
import MyDashboardViewerHeader from '@/features/my-dashboards/components/MyDashboardViewerHeader'
import { useMyDashboardViewerState } from '@/features/my-dashboards/hooks/use-my-dashboard-viewer-state'

export default function VisualizarDashboardPage() {
  const { dashboardId: dashboardIdParam } = useParams({ strict: false })
  const dashboardId = Number(dashboardIdParam)

  const {
    dashboard,
    isLoading,
    isError,
    error,
    isInfoDrawerOpen,
    closeInfoDrawer,
    toggleInfoDrawer,
    isFavorite,
    toggleFavorite,
    isTogglingFavorite,
    favoriteError,
  } = useMyDashboardViewerState(dashboardId)

  if (!Number.isFinite(dashboardId) || dashboardId <= 0) {
    return (
      <div className="space-y-4">
        <Alert variant="error">Identificador de dashboard inválido.</Alert>
        <Link to="/" className="text-sm text-vscode-accent hover:underline">
          Voltar para Meus Dashboards
        </Link>
      </div>
    )
  }

  const isForbidden = error instanceof ApiError && error.statusCode === 403
  const isNotFound = error instanceof ApiError && error.statusCode === 404

  const errorMessage = isForbidden
    ? 'Você não tem acesso a este dashboard.'
    : isNotFound
      ? 'Dashboard não encontrado.'
      : error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Não foi possível carregar o dashboard.'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-vscode-border/60" />
            <div className="h-6 w-48 animate-pulse rounded bg-vscode-border/60" />
          </div>
        ) : dashboard ? (
          <MyDashboardViewerHeader
            dashboardName={dashboard.nome}
            dashboardIcon={dashboard.icone}
            isFavorite={isFavorite}
            isTogglingFavorite={isTogglingFavorite}
            isInfoDrawerOpen={isInfoDrawerOpen}
            onToggleFavorite={toggleFavorite}
            onToggleInfoDrawer={toggleInfoDrawer}
          />
        ) : null}

        {favoriteError && <Alert variant="error">{favoriteError}</Alert>}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-vscode-border bg-vscode-sidebar px-6 py-16 text-sm text-vscode-text-muted">
            Carregando dashboard...
          </div>
        ) : isError || !dashboard ? (
          <div className="space-y-4">
            <Alert variant="error">{errorMessage}</Alert>
            <Link to="/" className="text-sm text-vscode-accent hover:underline">
              Voltar para Meus Dashboards
            </Link>
          </div>
        ) : (
          <DashboardViewerFrame
            dashboardName={dashboard.nome}
            url={dashboard.url}
            query={dashboard.query}
          />
        )}
      </div>

      <MyDashboardInfoDrawer
        isOpen={isInfoDrawerOpen}
        dashboard={dashboard}
        onClose={closeInfoDrawer}
      />
    </div>
  )
}
