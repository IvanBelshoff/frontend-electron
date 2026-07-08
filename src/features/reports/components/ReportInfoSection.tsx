import SettingsCard from '@/components/settings/SettingsCard'
import SettingsCardHeader from '@/components/settings/SettingsCardHeader'
import SettingsInfoGrid from '@/components/settings/SettingsInfoGrid'
import { InfoIcon } from '@/components/settings/SettingsIcons'
import type { Report } from '@/features/reports/report-types'
import { formatReportDate } from '@/features/reports/format-report-date'
import UserAvatar from '@/features/user/UserAvatar'

type ReportInfoSectionProps = {
  report: Report
}

export default function ReportInfoSection({ report }: ReportInfoSectionProps) {
  const users = report.usuarios ?? []

  return (
    <SettingsCard>
      <SettingsCardHeader
        icon={<InfoIcon />}
        title="Informações do relatório"
        description="Resumo de rastreabilidade e usuários com acesso."
      />

      <SettingsInfoGrid
        items={[
          {
            label: 'Conexão',
            value: report.conexao?.nome ?? '—',
          },
          {
            label: 'Estado',
            value: report.estado,
          },
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
        ]}
      />

      <div className="mt-4 space-y-2">
        <span className="block text-xs font-medium text-vscode-text-muted">
          Usuários com acesso
        </span>

        {users.length === 0 ? (
          <p className="text-sm text-vscode-text-muted">Nenhum usuário vinculado.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {users.map((user) => (
              <span
                key={user.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-vscode-border bg-vscode-bg/40 px-2.5 py-1 text-xs text-vscode-text"
              >
                <UserAvatar
                  userId={user.id}
                  nome={user.nome}
                  sobrenome={user.sobrenome}
                  foto={user.foto}
                  className="h-6 w-6 text-[10px]"
                />
                {user.nome} {user.sobrenome}
              </span>
            ))}
          </div>
        )}
      </div>
    </SettingsCard>
  )
}
