import { useEffect, useState } from 'react'
import { notificationStore } from './notification-store'
import type { NotificationItem } from './notification-types'

export function useNotifications(): NotificationItem[] {
  const [items, setItems] = useState<NotificationItem[]>(notificationStore.getItems())

  useEffect(() => notificationStore.subscribe(() => setItems(notificationStore.getItems())), [])

  return items
}
