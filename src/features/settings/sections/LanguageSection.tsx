import { useState } from 'react'
import SettingsCard from '@/components/settings/SettingsCard'
import SettingsCardHeader from '@/components/settings/SettingsCardHeader'
import SettingsField from '@/components/settings/SettingsField'
import { LanguageIcon } from '@/components/settings/SettingsIcons'
import SettingsSelect from '@/components/settings/SettingsSelect'
import type { AppLanguage } from '@/features/settings/settings-types'

export default function LanguageSection() {
  const [language, setLanguage] = useState<AppLanguage>('pt-BR')

  return (
    <SettingsCard>
      <SettingsCardHeader
        icon={<LanguageIcon />}
        title="Idioma"
        description="Selecione o idioma principal da experiência."
      />

      <SettingsField label="Idioma da interface" htmlFor="settingsLanguage">
        <SettingsSelect
          id="settingsLanguage"
          value={language}
          onChange={(event) => setLanguage(event.target.value as AppLanguage)}
        >
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en-US">English (US)</option>
          <option value="es-ES">Español</option>
        </SettingsSelect>
      </SettingsField>
    </SettingsCard>
  )
}
