import SettingsPageHeader from '@/components/settings/SettingsPageHeader'
import BackendUrlSection from '@/features/settings/sections/BackendUrlSection'
import GeneralInfoSection from '@/features/settings/sections/GeneralInfoSection'
import LanguageSection from '@/features/settings/sections/LanguageSection'
import ThemeSection from '@/features/settings/sections/ThemeSection'

export default function ConfiguracoesPage() {
  return (
    <div className="h-full min-h-0 space-y-6 overflow-y-auto">
      <SettingsPageHeader title="Configurações" />

      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BackendUrlSection />
        <ThemeSection />
        <LanguageSection />
      </div>

      <GeneralInfoSection />
    </div>
  )
}
