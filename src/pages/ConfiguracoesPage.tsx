import SettingsPageHeader from '@/components/settings/SettingsPageHeader'
import BackendUrlSection from '@/features/settings/sections/BackendUrlSection'
import GeneralInfoSection from '@/features/settings/sections/GeneralInfoSection'
import LanguageSection from '@/features/settings/sections/LanguageSection'
import PersonalizacoesSection from '@/features/settings/sections/PersonalizacoesSection'

export default function ConfiguracoesPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 pb-4 lg:pb-6">
        <SettingsPageHeader title="Configurações" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto lg:overflow-hidden">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:overflow-hidden">
          <div className="flex h-full min-h-0 flex-col lg:col-start-1 lg:row-start-1">
            <BackendUrlSection />
          </div>

          <div className="flex h-full min-h-0 flex-col lg:col-start-1 lg:row-start-2">
            <LanguageSection />
          </div>

          <div className="flex min-h-[28rem] flex-col lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-full lg:min-h-0">
            <PersonalizacoesSection />
          </div>
        </div>

        <div className="shrink-0">
          <GeneralInfoSection />
        </div>
      </div>
    </div>
  )
}
