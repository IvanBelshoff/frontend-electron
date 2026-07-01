import SettingsCard from '@/components/settings/SettingsCard'
import SettingsCardHeader from '@/components/settings/SettingsCardHeader'
import SettingsInfoGrid from '@/components/settings/SettingsInfoGrid'
import { DownloadIcon, InfoIcon, RefreshIcon } from '@/components/settings/SettingsIcons'
import IconButton from '@/components/ui/IconButton'

export default function GeneralInfoSection() {
  const environmentLabel = import.meta.env.MODE === 'production' ? 'Produção' : 'Desenvolvimento'

  return (
    <SettingsCard>
      <header className="mb-4 flex flex-wrap items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-vscode-accent/15 text-vscode-accent">
          <InfoIcon />
        </span>

        <div className="min-w-0 flex-1">
          <strong className="block text-sm font-semibold text-vscode-text">Informações gerais</strong>
          <small className="mt-0.5 block text-xs text-vscode-text-muted">
            Dados institucionais e técnicos desta instalação.
          </small>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-full border border-vscode-border px-3 py-1 text-xs text-vscode-text-muted">
            <span className="h-2 w-2 rounded-full bg-vscode-success" aria-hidden="true" />
            Sistema atualizado
          </span>

          <IconButton icon={<RefreshIcon />} label="Procurar atualização" title="Procurar atualização" />
          <IconButton
            icon={<DownloadIcon />}
            label="Baixar atualização"
            title="Baixar atualização"
            disabled
          />
        </div>
      </header>

      <SettingsInfoGrid
        items={[
          { label: 'Versão do sistema', value: 'v0.1.0' },
          { label: 'Desenvolvido por', value: 'Silexcode' },
          { label: 'Ambiente', value: environmentLabel },
          { label: 'Plataforma', value: 'Desktop (Electron)' },
        ]}
      />
    </SettingsCard>
  )
}
