import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import NotificationVariantRenderer from '@/features/notifications/components/NotificationVariantRenderer'
import { NOTIFICATION_PLACEMENT_CLASSES } from '@/features/notifications/notification-placement-utils'
import { notificationStore } from '@/features/notifications/notification-store'
import type { NotificationItem, NotificationPlacement } from '@/features/notifications/notification-types'

const PLACEMENTS: NotificationPlacement[] = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'middle-center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]

function groupByPlacement(items: NotificationItem[]) {
  const groups = new Map<NotificationPlacement, NotificationItem[]>()

  for (const placement of PLACEMENTS) {
    groups.set(placement, [])
  }

  for (const item of items) {
    groups.get(item.placement)?.push(item)
  }

  return groups
}

export default function NotificationHost() {
  const [items, setItems] = useState<NotificationItem[]>(notificationStore.getItems())

  useEffect(() => notificationStore.subscribe(() => setItems(notificationStore.getItems())), [])

  if (typeof document === 'undefined') {
    return null
  }

  const groups = groupByPlacement(items)

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[100]">
      {PLACEMENTS.map((placement) => {
        const placementItems = groups.get(placement) ?? []
        if (placementItems.length === 0) {
          return null
        }

        return (
          <div
            key={placement}
            className={clsx(
              'absolute flex max-h-[calc(100vh-2rem)] flex-col gap-2 overflow-hidden p-4',
              NOTIFICATION_PLACEMENT_CLASSES[placement],
            )}
          >
            {placementItems.map((item, index) => (
              <NotificationVariantRenderer key={item.id} item={item} stackIndex={index} />
            ))}
          </div>
        )
      })}
    </div>,
    document.body,
  )
}
