import NotificationPositionPicker from '@/features/notifications/components/NotificationPositionPicker'
import NotificationStylePicker from '@/features/notifications/components/NotificationStylePicker'
import {
  getNotificationPlacement,
  getNotificationStyle,
  writePreferredNotificationPlacement,
  writePreferredNotificationStyle,
} from '@/features/notifications/notification-preferences'
import type { NotificationDisplayStyle, NotificationPlacement } from '@/features/notifications/notification-types'
import { useUserPreferences } from '@/features/settings/use-user-preferences'

export default function NotificationSettingsPanel() {
  const { notification } = useUserPreferences()

  const handleStyleChange = (style: NotificationDisplayStyle) => {
    writePreferredNotificationStyle(style)
  }

  const handlePlacementChange = (placement: NotificationPlacement) => {
    writePreferredNotificationPlacement(placement)
  }

  return (
    <div className="flex min-h-0 flex-col gap-5">
      <section className="shrink-0 rounded-lg border border-vscode-border bg-vscode-bg p-4">
        <div className="space-y-3 text-center">
          <div>
            <h4 className="text-sm font-semibold text-vscode-text">Posição na tela</h4>
            <p className="mt-0.5 text-xs text-vscode-text-muted">
              Onde as notificações devem aparecer por padrão.
            </p>
          </div>
          <NotificationPositionPicker
            value={notification.placement ?? getNotificationPlacement()}
            onChange={handlePlacementChange}
          />
        </div>
      </section>

      <section className="flex min-h-0 flex-col gap-3">
        <div className="shrink-0">
          <h4 className="text-sm font-semibold text-vscode-text">Estilo visual</h4>
          <p className="mt-0.5 text-xs text-vscode-text-muted">
            Estilo usado em todas as notificações do app. Teste cada opção antes de selecionar.
          </p>
        </div>
        <NotificationStylePicker
          selectedStyle={notification.style ?? getNotificationStyle()}
          selectedPlacement={notification.placement ?? getNotificationPlacement()}
          onStyleChange={handleStyleChange}
        />
      </section>
    </div>
  )
}
