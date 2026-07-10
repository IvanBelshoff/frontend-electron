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
    <div className="inline-flex flex-col items-center space-y-1.5">
      <p className="text-center text-[11px] text-vscode-text-muted">
        <span className="text-vscode-text">{getNotificationPlacementLabel(value)}</span>
      </p>

      <div
        className="rounded border border-vscode-border bg-vscode-sidebar p-2"
        role="radiogroup"
        aria-label="Posição das notificações na tela"
      >
        <div className="grid grid-cols-3 gap-1">
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
                  'flex h-7 w-7 items-center justify-center rounded border transition-colors',
                  isSelected
                    ? 'border-vscode-accent bg-vscode-accent/15'
                    : 'border-vscode-border bg-vscode-bg hover:border-vscode-accent/40',
                )}
              >
                <span
                  className={clsx(
                    'h-1.5 w-1.5 rounded-full',
                    isSelected ? 'bg-vscode-accent' : 'bg-vscode-border',
                  )}
                  aria-hidden="true"
                />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
