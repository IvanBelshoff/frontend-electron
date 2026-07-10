import clsx from 'clsx'
import {
  NOTIFICATION_PLACEMENTS,
  getNotificationPlacementLabel,
} from '@/features/notifications/notification-placement-utils'
import type { NotificationPlacement } from '@/features/notifications/notification-types'

type NotificationPositionPickerProps = {
  value: NotificationPlacement
  onChange: (placement: NotificationPlacement) => void
}

export default function NotificationPositionPicker({
  value,
  onChange,
}: NotificationPositionPickerProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-vscode-text-muted">
        Posição padrão: <span className="text-vscode-text">{getNotificationPlacementLabel(value)}</span>
      </p>

      <div
        className="mx-auto w-full max-w-xs rounded border border-vscode-border bg-vscode-bg p-3"
        role="radiogroup"
        aria-label="Posição das notificações na tela"
      >
        <div className="mb-2 text-center text-[10px] font-medium uppercase tracking-wide text-vscode-text-muted">
          Tela
        </div>

        <div className="grid grid-cols-3 gap-2 pb-1">
          {NOTIFICATION_PLACEMENTS.map((placement) => {
            const isSelected = value === placement

            return (
              <button
                key={placement}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={getNotificationPlacementLabel(placement)}
                title={getNotificationPlacementLabel(placement)}
                onClick={() => onChange(placement)}
                className={clsx(
                  'flex aspect-square items-center justify-center rounded border transition-colors',
                  isSelected
                    ? 'border-vscode-accent bg-vscode-accent/15'
                    : 'border-vscode-border bg-vscode-sidebar hover:border-vscode-accent/40',
                )}
              >
                <span
                  className={clsx(
                    'h-2.5 w-2.5 rounded-full',
                    isSelected ? 'bg-vscode-accent' : 'bg-vscode-border',
                  )}
                  aria-hidden="true"
                />
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-center text-xs text-vscode-text-muted">
        {getNotificationPlacementLabel(value)}
      </p>
    </div>
  )
}
