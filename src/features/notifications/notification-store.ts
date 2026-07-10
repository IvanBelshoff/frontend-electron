import {
  DEFAULT_NOTIFICATION_STYLE,
  getNotificationPlacement,
} from './notification-preferences'
import type { NotificationItem, ShowNotificationInput } from './notification-types'

type Listener = () => void

let items: NotificationItem[] = []
const listeners = new Set<Listener>()

let idCounter = 0

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

function createId(): string {
  idCounter += 1
  return `notification-${idCounter}-${Date.now()}`
}

export const notificationStore = {
  getItems: () => items,

  subscribe: (listener: Listener) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  add: (input: ShowNotificationInput): string => {
    const id = createId()
    const item: NotificationItem = {
      id,
      tone: input.tone,
      title: input.title,
      description: input.description,
      displayStyle: input.displayStyle ?? DEFAULT_NOTIFICATION_STYLE,
      placement: input.placement ?? getNotificationPlacement(),
      durationMs: input.durationMs ?? 4000,
      dismissible: input.dismissible ?? true,
      createdAt: Date.now(),
      phase: 'entering',
      paused: false,
      progressKey: 0,
    }

    items = [...items, item]
    notifyListeners()

    window.setTimeout(() => {
      notificationStore.setPhase(id, 'visible')
    }, 20)

    return id
  },

  setPhase: (id: string, phase: NotificationItem['phase']) => {
    items = items.map((item) => (item.id === id ? { ...item, phase } : item))
    notifyListeners()
  },

  setPaused: (id: string, paused: boolean) => {
    items = items.map((item) =>
      item.id === id
        ? {
            ...item,
            paused,
            progressKey: paused ? item.progressKey : item.progressKey + 1,
          }
        : item,
    )
    notifyListeners()
  },

  remove: (id: string) => {
    items = items.filter((item) => item.id !== id)
    notifyListeners()
  },

  dismiss: (id: string) => {
    const item = items.find((entry) => entry.id === id)
    if (!item || item.phase === 'exiting') {
      return
    }

    notificationStore.setPhase(id, 'exiting')
  },

  clear: () => {
    items = []
    notifyListeners()
  },
}
