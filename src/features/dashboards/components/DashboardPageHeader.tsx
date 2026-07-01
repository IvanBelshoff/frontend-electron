import { RefreshIcon } from '@/components/settings/SettingsIcons'
import IconButton from '@/components/ui/IconButton'

type DashboardPageHeaderProps = {
  filteredCount: number
  totalCount: number
  isRefreshing: boolean
  onRefresh: () => void
}

export default function DashboardPageHeader({
  filteredCount,
  totalCount,
  isRefreshing,
  onRefresh,
}: DashboardPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold text-vscode-text">Gerenciamento de Dashboards</h1>

      <div className="flex items-center gap-2">
        <span className="rounded-full border border-vscode-border px-3 py-1 text-xs text-vscode-text-muted">
          Exibindo {filteredCount} de {totalCount} dashboards
        </span>

        <IconButton
          icon={
            isRefreshing ? (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                aria-hidden="true"
              />
            ) : (
              <RefreshIcon />
            )
          }
          label="Atualizar listagem"
          title="Atualizar listagem"
          onClick={onRefresh}
          disabled={isRefreshing}
        />
      </div>
    </header>
  )
}
