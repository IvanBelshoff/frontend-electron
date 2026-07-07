import SettingsInfoGrid from '@/components/settings/SettingsInfoGrid'
import DashboardStatusBadges from '@/features/dashboards/components/DashboardStatusBadges'
import type { Dashboard } from '@/features/dashboards/dashboard-types'
import { formatDashboardDate } from '@/features/dashboards/format-dashboard-date'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import Drawer from '@/components/ui/Drawer'

type MyDashboardInfoDrawerProps = {
  isOpen: boolean
  dashboard: Dashboard | null
  onClose: () => void
}

export default function MyDashboardInfoDrawer({
  isOpen,
  dashboard,
  onClose,
}: MyDashboardInfoDrawerProps) {
  if (!dashboard) {
    return null
  }

  const infoItems = [
    {
      label: 'Criado por',
      value: dashboard.usuarioCadastrador ?? '—',
    },
    {
      label: 'Atualizado por',
      value: dashboard.usuarioAtualizador ?? '—',
    },
    {
      label: 'Data de criação',
      value: formatDashboardDate(dashboard.dataCriacao),
    },
    {
      label: 'Data de atualização',
      value: formatDashboardDate(dashboard.dataAtualizacao),
    },
  ]

  if (dashboard.temporario) {
    infoItems.push(
      {
        label: 'Válido de',
        value: formatDashboardDate(dashboard.dataExpiracaoInicial),
      },
      {
        label: 'Válido até',
        value: formatDashboardDate(dashboard.dataExpiracaoFinal),
      },
    )
  }

  return (
    <Drawer isOpen={isOpen} title="Informações do dashboard" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-vscode-border bg-vscode-bg/40 p-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent">
            <DashboardMaterialIcon name={dashboard.icone} className="text-2xl" filled />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-vscode-text">{dashboard.nome}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <DashboardStatusBadges dashboard={dashboard} field="privacidade" />
              <DashboardStatusBadges dashboard={dashboard} field="temporario" />
            </div>
          </div>
        </div>

        <SettingsInfoGrid items={infoItems} />
      </div>
    </Drawer>
  )
}
