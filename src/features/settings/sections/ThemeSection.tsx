import { useState } from 'react'
import AccentColorPicker from '@/components/settings/AccentColorPicker'
import SettingsCard from '@/components/settings/SettingsCard'
import SettingsCardHeader from '@/components/settings/SettingsCardHeader'
import SettingsField from '@/components/settings/SettingsField'
import SettingsSegmentedControl from '@/components/settings/SettingsSegmentedControl'
import { MonitorIcon, MoonIcon, PaletteIcon, RefreshIcon, SunIcon } from '@/components/settings/SettingsIcons'
import IconButton from '@/components/ui/IconButton'
import NotificationSettingsModal from '@/features/notifications/components/NotificationSettingsModal'
import { getNotificationPlacementLabel } from '@/features/notifications/notification-placement-utils'
import {
  getNotificationPlacement,
  getNotificationStyle,
} from '@/features/notifications/notification-preferences'
import { getNotificationVariant } from '@/features/notifications/notification-variants-catalog'
import { DEFAULT_ACCENT_COLOR } from '@/features/settings/accent-colors'
import { useTheme } from '@/features/settings/theme/theme-provider'
import type { ThemePreference } from '@/features/settings/settings-types'

export default function ThemeSection() {
  const { theme, setTheme, accentColor, setAccentColor, resetAccentColor } = useTheme()
  const isDefaultAccent = accentColor.toUpperCase() === DEFAULT_ACCENT_COLOR.toUpperCase()
  const [modalOpen, setModalOpen] = useState(false)
  const [notificationStyle, setNotificationStyle] = useState(getNotificationStyle)
  const [notificationPlacement, setNotificationPlacement] = useState(getNotificationPlacement)
  const variant = getNotificationVariant(notificationStyle)

  const handleCloseModal = () => {
    setModalOpen(false)
    setNotificationStyle(getNotificationStyle())
    setNotificationPlacement(getNotificationPlacement())
  }

  return (
    <div className="h-full">
      <SettingsCard className="h-full">
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

          <SettingsField label="Notificações">
            <p className="text-xs text-vscode-text-muted">
              {variant.name} · {getNotificationPlacementLabel(notificationPlacement).toLowerCase()}.{' '}
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="text-vscode-accent hover:underline focus:outline-none focus:ring-2 focus:ring-vscode-accent/40"
              >
                Personalizar
              </button>
            </p>
          </SettingsField>
        </div>
      </SettingsCard>

      <NotificationSettingsModal isOpen={modalOpen} onClose={handleCloseModal} />
    </div>
  )
}
