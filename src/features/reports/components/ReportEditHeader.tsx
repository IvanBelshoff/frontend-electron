import { RefreshIcon } from '@/components/settings/SettingsIcons'
import IconButton from '@/components/ui/IconButton'
import ReportFormBreadcrumb from '@/features/reports/components/ReportFormBreadcrumb'
import { TrashIcon } from '@/features/dashboards/icons/DashboardIcons'

type ReportEditHeaderProps = {
  reportName: string
  isRefreshing: boolean
  onRefresh: () => void
  onDelete: () => void
}

export default function ReportEditHeader({
  reportName,
  isRefreshing,
  onRefresh,
  onDelete,
}: ReportEditHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <ReportFormBreadcrumb
        parent={{ label: 'Gerenciamento de Relatórios', to: '/relatorios/gerenciar' }}
        current={reportName}
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
          label="Atualizar relatório"
          title="Atualizar relatório"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9 w-9 rounded-full border border-vscode-border text-emerald-400 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300 disabled:opacity-50"
        />

        <IconButton
          icon={<TrashIcon className="h-4 w-4" />}
          label="Excluir relatório"
          title="Excluir relatório"
          onClick={onDelete}
          className="h-9 w-9 rounded-full border border-vscode-border text-red-400 hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
        />
      </div>
    </header>
  )
}
