import PreferenceFieldList from '@/components/settings/preference-designer/PreferenceFieldList'
import type { PreferenceFieldConfig } from '@/components/settings/preference-designer/preference-field.types'
import { MonitorIcon, MoonIcon, SunIcon } from '@/components/settings/SettingsIcons'
import type { ThemePreference } from '@/features/settings/settings-types'
import { useTheme } from '@/features/settings/theme/theme-provider'

const themeFields: PreferenceFieldConfig[] = [
  {
    kind: 'segmented',
    key: 'theme',
    label: 'Modo de exibição',
    ariaLabel: 'Selecionar tema',
    options: [
      { value: 'system', label: 'Sistema', icon: <MonitorIcon /> },
      { value: 'dark', label: 'Escuro', icon: <MoonIcon /> },
      { value: 'light', label: 'Claro', icon: <SunIcon /> },
    ],
  },
  {
    kind: 'accentColor',
    key: 'accentColor',
    label: 'Cor primária',
    hint: 'Cor de destaque da aplicação. Afeta botões, links e elementos ativos.',
  },
]

export default function PersonalizacaoTemaTab() {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme()

  const handleChange = (patch: Record<string, unknown>) => {
    if ('theme' in patch) {
      setTheme(patch.theme as ThemePreference)
    }

    if ('accentColor' in patch) {
      setAccentColor(String(patch.accentColor))
    }
  }

  return (
    <PreferenceFieldList
      fields={themeFields}
      value={{ theme, accentColor }}
      onChange={handleChange}
    />
  )
}
