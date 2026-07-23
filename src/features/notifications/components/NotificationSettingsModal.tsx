import { useEffect, useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import NotificationSettingsPanel from '@/features/settings/components/NotificationSettingsPanel'

type NotificationSettingsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationSettingsModal({
  isOpen,
  onClose,
}: NotificationSettingsModalProps) {
  const [renderKey, setRenderKey] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setRenderKey((current) => current + 1)
    }
  }, [isOpen])

  return (
    <Dialog
      isOpen={isOpen}
      title="Personalizar notificações"
      onClose={onClose}
      className="!max-w-5xl"
      closeAriaLabel="Fechar personalização de notificações"
    >
      <div key={renderKey} className="flex max-h-[min(75vh,48rem)] flex-col overflow-y-auto">
        <NotificationSettingsPanel />
      </div>
    </Dialog>
  )
}
