import AccentColorPicker from '@/components/settings/AccentColorPicker'
import SettingsCard from '@/components/settings/SettingsCard'
import SettingsCardHeader from '@/components/settings/SettingsCardHeader'
import SettingsField from '@/components/settings/SettingsField'
import SettingsSegmentedControl from '@/components/settings/SettingsSegmentedControl'
import { MonitorIcon, MoonIcon, PaletteIcon, RefreshIcon, SunIcon } from '@/components/settings/SettingsIcons'
import IconButton from '@/components/ui/IconButton'
import { DEFAULT_ACCENT_COLOR } from '@/features/settings/accent-colors'
import { useTheme } from '@/features/settings/theme/theme-provider'
import type { ThemePreference } from '@/features/settings/settings-types'

export default function ThemeSection() {
  const { theme, setTheme, accentColor, setAccentColor, resetAccentColor } = useTheme()
  const isDefaultAccent = accentColor.toUpperCase() === DEFAULT_ACCENT_COLOR.toUpperCase()

  return (
    <SettingsCard>
      <SettingsCardHeader
        icon={<PaletteIcon />}
        title="Tema"
        description="Escolha visual preferido para a interface."
        actions={
          <IconButton
            icon={<RefreshIcon />}
            label="Restaurar cor primária padrão"
            title="Restaurar cor padrão"
            onClick={resetAccentColor}
            disabled={isDefaultAccent}
          />
        }
      />

      <div className="space-y-5">
        <SettingsField label="Modo de exibição">
          <SettingsSegmentedControl<ThemePreference>
            ariaLabel="Selecionar tema"
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'system', label: 'Sistema', icon: <MonitorIcon /> },
              { value: 'dark', label: 'Escuro', icon: <MoonIcon /> },
              { value: 'light', label: 'Claro', icon: <SunIcon /> },
            ]}
          />
        </SettingsField>

        <SettingsField
          label="Cor primária"
          hint="Cor de destaque da aplicação. Afeta botões, links e elementos ativos."
        >
          <AccentColorPicker value={accentColor} onChange={setAccentColor} />
        </SettingsField>
      </div>
    </SettingsCard>
  )
}
