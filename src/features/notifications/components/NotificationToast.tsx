import clsx from 'clsx'
import { useEffect } from 'react'
import IconButton from '@/components/ui/IconButton'
import NotificationCircularProgress from '@/features/notifications/components/NotificationCircularProgress'
import NotificationProgressBar from '@/features/notifications/components/NotificationProgressBar'
import {
  getNotificationToneClasses,
  getNotificationToneIcon,
} from '@/features/notifications/notification-tone-utils'
import { getNotificationVariant } from '@/features/notifications/notification-variants-catalog'
import { notificationStore } from '@/features/notifications/notification-store'
import type { NotificationItem } from '@/features/notifications/notification-types'

type NotificationToastProps = {
  item: NotificationItem
  stackIndex: number
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export default function NotificationToast({ item, stackIndex }: NotificationToastProps) {
  const variant = getNotificationVariant(item.displayStyle)
  const toneClasses = getNotificationToneClasses(item.tone)
  const isExiting = item.phase === 'exiting'
  const animationClass = isExiting ? variant.exitClass : variant.enterClass

  useEffect(() => {
    if (!isExiting) {
      return
    }

    const timeout = window.setTimeout(() => {
      notificationStore.remove(item.id)
    }, 320)

    return () => window.clearTimeout(timeout)
  }, [isExiting, item.id])

  const handleDismiss = () => {
    notificationStore.dismiss(item.id)
  }

  const handleProgressComplete = () => {
    if (!item.paused) {
      notificationStore.dismiss(item.id)
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'pointer-events-auto overflow-hidden rounded border shadow-lg',
        'bg-vscode-sidebar text-vscode-text',
        toneClasses.border,
        variant.containerClass,
        animationClass,
        item.displayStyle === 'stackShrink' && stackIndex > 0 && 'mt-2',
        item.displayStyle === 'timelineStack' && stackIndex > 0 && 'mt-3',
      )}
      style={
        item.displayStyle === 'stackShrink'
          ? { transform: `translateY(-${stackIndex * 4}px) scale(${1 - stackIndex * 0.02})` }
          : undefined
      }
      onMouseEnter={() => notificationStore.setPaused(item.id, true)}
      onMouseLeave={() => notificationStore.setPaused(item.id, false)}
    >
      <div
        className={clsx(
          'flex items-start gap-3 px-3 py-3',
          item.displayStyle === 'splitReveal' && 'notification-split-content',
          item.displayStyle === 'minimalStrip' && 'px-2 py-2',
        )}
      >
        {variant.showCircularProgress ? (
          <div className="relative flex h-9 w-9 items-center justify-center">
            <NotificationCircularProgress
              durationMs={item.durationMs}
              paused={item.paused}
              progressKey={item.progressKey}
              onComplete={handleProgressComplete}
            />
            <span
              className={clsx(
                'material-symbols-outlined absolute text-[1rem]',
                toneClasses.icon,
              )}
            >
              {getNotificationToneIcon(item.tone)}
            </span>
          </div>
        ) : variant.showIcon ? (
          <span
            className={clsx(
              'material-symbols-outlined mt-0.5 text-[1.15rem]',
              toneClasses.icon,
              item.displayStyle === 'splitReveal' && 'notification-split-icon',
            )}
          >
            {getNotificationToneIcon(item.tone)}
          </span>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-vscode-text">{item.title}</p>
          {item.description ? (
            <p className="mt-1 text-xs leading-relaxed text-vscode-text-muted">
              {item.description}
            </p>
          ) : null}
        </div>

        {item.dismissible ? (
          <IconButton
            icon={<CloseIcon />}
            label="Fechar notificação"
            onClick={handleDismiss}
            className="h-7 w-7 shrink-0 text-vscode-text-muted hover:text-vscode-text"
          />
        ) : null}
      </div>

      {variant.showProgressBar ? (
        <NotificationProgressBar
          durationMs={item.durationMs}
          paused={item.paused}
          progressKey={item.progressKey}
          onComplete={handleProgressComplete}
        />
      ) : null}
    </div>
  )
}
