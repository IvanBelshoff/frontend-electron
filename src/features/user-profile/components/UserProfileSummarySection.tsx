import SettingsInfoGrid from '@/components/settings/SettingsInfoGrid'
import type { UserProfileSummary } from '@/features/user-inbox/user-inbox-types'

type UserProfileSummarySectionProps = {
  summary: UserProfileSummary
}

export default function UserProfileSummarySection({
  summary,
}: UserProfileSummarySectionProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-vscode-text">Resumo da conta</h4>

      <SettingsInfoGrid
        items={[
          {
            label: 'Relatórios acessíveis',
            value: String(summary.relatoriosAcessiveis),
          },
          {
            label: 'Dashboards acessíveis',
            value: String(summary.dashboardsAcessiveis),
          },
          {
            label: 'Favoritos (relatórios)',
            value: String(summary.relatoriosFavoritos),
          },
          {
            label: 'Favoritos (dashboards)',
            value: String(summary.dashboardsFavoritos),
          },
          {
            label: 'Relatórios próprios',
            value: String(summary.relatoriosProprios),
          },
          {
            label: 'Notificações não lidas',
            value: String(summary.notificacoesNaoLidas),
          },
        ]}
      />
    </div>
  )
}
