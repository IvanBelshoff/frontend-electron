import SettingsInfoGrid from '@/components/settings/SettingsInfoGrid'
import Drawer from '@/components/ui/Drawer'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import { formatReportDate, formatReportDateOnly } from '@/features/reports/format-report-date'
import ReportStatusBadges from '@/features/reports/components/ReportStatusBadges'
import type { Report } from '@/features/reports/report-types'

type MyReportInfoDrawerProps = {
  isOpen: boolean
  report: Report | null
  onClose: () => void
}

export default function MyReportInfoDrawer({
  isOpen,
  report,
  onClose,
}: MyReportInfoDrawerProps) {
  if (!report) {
    return null
  }

  const infoItems = [
    {
      label: 'Criado por',
      value: report.usuarioCadastrador ?? '—',
    },
    {
      label: 'Atualizado por',
      value: report.usuarioAtualizador ?? '—',
    },
    {
      label: 'Data de criação',
      value: formatReportDate(report.dataCriacao),
    },
    {
      label: 'Data de atualização',
      value: formatReportDate(report.dataAtualizacao),
    },
    {
      label: 'Snapshot atualizado em',
      value: formatReportDate(report.snapshotAtualizadoEm),
    },
    {
      label: 'Conexão',
      value: report.conexao?.nome ?? '—',
    },
  ]

  if (report.temporario) {
    infoItems.push(
      {
        label: 'Válido de',
        value: formatReportDateOnly(report.dataExpiracaoInicial),
      },
      {
        label: 'Válido até',
        value: formatReportDateOnly(report.dataExpiracaoFinal),
      },
    )
  }

  return (
    <Drawer isOpen={isOpen} title="Informações do relatório" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-vscode-border bg-vscode-bg/40 p-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent">
            <DashboardMaterialIcon name={report.icone} className="text-2xl" filled />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-vscode-text">{report.nome}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <ReportStatusBadges report={report} field="estado" />
              <ReportStatusBadges report={report} field="privacidade" />
              <ReportStatusBadges report={report} field="temporario" />
              <ReportStatusBadges report={report} field="ia" />
            </div>
          </div>
        </div>

        <SettingsInfoGrid items={infoItems} />
      </div>
    </Drawer>
  )
}
