import { useState } from 'react'
import clsx from 'clsx'
import SettingsCard from '@/components/settings/SettingsCard'
import SettingsCardHeader from '@/components/settings/SettingsCardHeader'
import { PaletteIcon } from '@/components/settings/SettingsIcons'
import PersonalizacaoNotificacaoTab from '@/features/settings/components/PersonalizacaoNotificacaoTab'
import PersonalizacaoTabelasTab from '@/features/settings/components/PersonalizacaoTabelasTab'
import PersonalizacaoTemaTab from '@/features/settings/components/PersonalizacaoTemaTab'
import PersonalizacoesTabs from '@/features/settings/components/PersonalizacoesTabs'
import PersonalizacoesRestoreButton from '@/features/settings/components/PersonalizacoesRestoreButton'
import type { PersonalizacoesTab } from '@/features/settings/personalizacoes-types'

export default function PersonalizacoesSection() {
  const [activeTab, setActiveTab] = useState<PersonalizacoesTab>('theme')

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <SettingsCard className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 space-y-4 border-b border-vscode-border pb-4">
          <SettingsCardHeader
            icon={<PaletteIcon />}
            title="Personalizações"
            description="Ajuste tema, notificações e aparência das tabelas."
            actions={<PersonalizacoesRestoreButton activeTab={activeTab} />}
          />

          <PersonalizacoesTabs activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div
          className={clsx(
            'min-h-0 flex-1 pt-4',
            activeTab === 'tables'
              ? 'flex flex-col overflow-hidden'
              : 'overflow-y-auto',
          )}
          role="tabpanel"
          aria-label={
            activeTab === 'theme'
              ? 'Tema'
              : activeTab === 'notification'
                ? 'Notificação'
                : 'Tabelas'
          }
        >
          {activeTab === 'theme' ? (
            <PersonalizacaoTemaTab />
          ) : activeTab === 'notification' ? (
            <PersonalizacaoNotificacaoTab />
          ) : (
            <PersonalizacaoTabelasTab />
          )}
        </div>
      </SettingsCard>
    </div>
  )
}
