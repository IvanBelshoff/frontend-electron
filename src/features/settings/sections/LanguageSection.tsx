import SettingsCard from '@/components/settings/SettingsCard'
import SettingsCardHeader from '@/components/settings/SettingsCardHeader'
import SettingsField from '@/components/settings/SettingsField'
import { LanguageIcon } from '@/components/settings/SettingsIcons'
import SettingsSelect from '@/components/settings/SettingsSelect'
import type { AppLanguage } from '@/features/settings/settings-types'
import { scheduleUserPreferencesPersist } from '@/features/settings/user-preferences-sync'
import { useUserPreferences } from '@/features/settings/use-user-preferences'

export default function LanguageSection() {
  const { language } = useUserPreferences()

  return (
    <SettingsCard className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0">
        <SettingsCardHeader
          icon={<LanguageIcon />}
          title="Idioma"
          description="Selecione o idioma principal da experiência."
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pt-5">
      <SettingsField label="Idioma da interface" htmlFor="settingsLanguage">
        <SettingsSelect
          id="settingsLanguage"
          value={language}
          onChange={(event) =>
            scheduleUserPreferencesPersist({ language: event.target.value as AppLanguage })
          }
        >
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en-US">English (US)</option>
          <option value="es-ES">Español</option>
        </SettingsSelect>
      </SettingsField>
      </div>
    </SettingsCard>
  )
}
