import { useMemo } from 'react'
import {
  DEFAULT_NOTIFICATION_PLACEMENT,
  DEFAULT_NOTIFICATION_STYLE,
  resetNotificationPreferences,
} from '@/features/notifications/notification-preferences'
import { DEFAULT_ACCENT_COLOR } from '@/features/settings/accent-colors'
import {
  isDefaultDataGridStyle,
  resetDataGridStylePreference,
} from '@/features/settings/data-grid-style-preferences'
import type { PersonalizacoesTab } from '@/features/settings/personalizacoes-types'
import { useTheme } from '@/features/settings/theme/theme-provider'
import { useUserPreferences } from '@/features/settings/use-user-preferences'

export function usePersonalizacoesRestore(activeTab: PersonalizacoesTab) {
  const { theme, accentColor, resetThemePreferences } = useTheme()
  const { notification, dataGridStyle } = useUserPreferences()

  return useMemo(() => {
    switch (activeTab) {
      case 'theme': {
        const isDefault =
          theme === 'system' &&
          accentColor.toUpperCase() === DEFAULT_ACCENT_COLOR.toUpperCase()

        return {
          label: 'Restaurar padrões de tema',
          title: 'Restaurar tema e cor primária',
          disabled: isDefault,
          onClick: resetThemePreferences,
        }
      }

      case 'notification': {
        const isDefault =
          notification.style === DEFAULT_NOTIFICATION_STYLE &&
          notification.placement === DEFAULT_NOTIFICATION_PLACEMENT

        return {
          label: 'Restaurar padrões de notificação',
          title: 'Restaurar estilo e posição das notificações',
          disabled: isDefault,
          onClick: resetNotificationPreferences,
        }
      }

      case 'tables': {
        const isDefault = isDefaultDataGridStyle(dataGridStyle)

        return {
          label: 'Restaurar padrões de tabela',
          title: 'Restaurar aparência das tabelas',
          disabled: isDefault,
          onClick: resetDataGridStylePreference,
        }
      }
    }
  }, [
    accentColor,
    activeTab,
    dataGridStyle,
    notification.placement,
    notification.style,
    resetThemePreferences,
    theme,
  ])
}
