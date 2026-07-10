import { useEffect, useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import NotificationPositionPicker from '@/features/notifications/components/NotificationPositionPicker'
import NotificationStylePicker from '@/features/notifications/components/NotificationStylePicker'
import {
  getNotificationPlacement,
  getNotificationStyle,
  writePreferredNotificationPlacement,
  writePreferredNotificationStyle,
} from '@/features/notifications/notification-preferences'
import type { NotificationDisplayStyle, NotificationPlacement } from '@/features/notifications/notification-types'

type NotificationSettingsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationSettingsModal({
  isOpen,
  onClose,
}: NotificationSettingsModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<NotificationDisplayStyle>(getNotificationStyle)
  const [selectedPlacement, setSelectedPlacement] = useState<NotificationPlacement>(getNotificationPlacement)

  useEffect(() => {
    if (isOpen) {
      setSelectedStyle(getNotificationStyle())
      setSelectedPlacement(getNotificationPlacement())
    }
  }, [isOpen])

  const handleStyleChange = (style: NotificationDisplayStyle) => {
    writePreferredNotificationStyle(style)
    setSelectedStyle(style)
  }

  const handlePlacementChange = (placement: NotificationPlacement) => {
    writePreferredNotificationPlacement(placement)
    setSelectedPlacement(placement)
  }

  return (
    <Dialog
      isOpen={isOpen}
      title="Personalizar notificações"
      onClose={onClose}
      className="!max-w-5xl"
      closeAriaLabel="Fechar personalização de notificações"
    >
      <div className="flex max-h-[min(75vh,48rem)] flex-col gap-4">
        <section className="shrink-0 rounded border border-vscode-border bg-vscode-bg p-3">
          <div className="space-y-3 text-center">
            <div>
              <h4 className="text-sm font-semibold text-vscode-text">Posição na tela</h4>
              <p className="mt-0.5 text-xs text-vscode-text-muted">
                Onde as notificações devem aparecer por padrão.
              </p>
            </div>
            <NotificationPositionPicker
              value={selectedPlacement}
              onChange={handlePlacementChange}
            />
          </div>
        </section>

        <section className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="shrink-0">
            <h4 className="text-sm font-semibold text-vscode-text">Estilo visual</h4>
            <p className="mt-0.5 text-xs text-vscode-text-muted">
              Estilo usado em todas as notificações do app. Teste cada opção antes de selecionar.
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <NotificationStylePicker
              selectedStyle={selectedStyle}
              selectedPlacement={selectedPlacement}
              onStyleChange={handleStyleChange}
            />
          </div>
        </section>
      </div>
    </Dialog>
  )
}
