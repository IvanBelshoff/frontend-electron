import { RefreshIcon } from '@/components/settings/SettingsIcons'
import IconButton from '@/components/ui/IconButton'
import DashboardFormBreadcrumb from '@/features/dashboards/components/DashboardFormBreadcrumb'
import { TrashIcon } from '@/features/dashboards/icons/DashboardIcons'

type DashboardEditHeaderProps = {
  dashboardName: string
  isRefreshing: boolean
  onRefresh: () => void
  onDelete: () => void
  canDelete?: boolean
}

export default function DashboardEditHeader({
  dashboardName,
  isRefreshing,
  onRefresh,
  onDelete,
  canDelete = true,
}: DashboardEditHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <DashboardFormBreadcrumb
        parent={{ label: 'Gerenciamento de Dashboards', to: '/dashboards' }}
        current={dashboardName}
      />

      <div className="flex items-center gap-2">
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
          label="Atualizar dashboard"
          title="Atualizar dashboard"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9 w-9 rounded-full border border-vscode-border text-emerald-400 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300 disabled:opacity-50"
        />

        <IconButton
          icon={<TrashIcon className="h-4 w-4" />}
          label="Excluir dashboard"
          title={
            canDelete ? 'Excluir dashboard' : 'Você não possui permissão para excluir dashboards.'
          }
          onClick={onDelete}
          disabled={!canDelete}
          className="h-9 w-9 rounded-full border border-vscode-border text-red-400 hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 disabled:opacity-40"
        />
      </div>
    </header>
  )
}
