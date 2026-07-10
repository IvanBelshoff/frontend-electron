import type { NotificationDisplayStyle, NotificationPlacement } from './notification-types'

const PREFERRED_STYLE_KEY = 'datadash.notification.preferredStyle'
const PREFERRED_PLACEMENT_KEY = 'datadash.notification.preferredPlacement'

export const DEFAULT_NOTIFICATION_STYLE: NotificationDisplayStyle = 'circularProgress'
export const DEFAULT_NOTIFICATION_PLACEMENT: NotificationPlacement = 'bottom-right'

export function readPreferredNotificationStyle(): NotificationDisplayStyle | null {
  if (typeof window === 'undefined') {
    return null
  }

  const stored = window.localStorage.getItem(PREFERRED_STYLE_KEY)
  return stored as NotificationDisplayStyle | null
}

export function getNotificationStyle(): NotificationDisplayStyle {
  return readPreferredNotificationStyle() ?? DEFAULT_NOTIFICATION_STYLE
}

export function writePreferredNotificationStyle(style: NotificationDisplayStyle) {
  window.localStorage.setItem(PREFERRED_STYLE_KEY, style)
}

export function readPreferredNotificationPlacement(): NotificationPlacement | null {
  if (typeof window === 'undefined') {
    return null
  }

  const stored = window.localStorage.getItem(PREFERRED_PLACEMENT_KEY)
  return stored as NotificationPlacement | null
}

export function getNotificationPlacement(): NotificationPlacement {
  return readPreferredNotificationPlacement() ?? DEFAULT_NOTIFICATION_PLACEMENT
}

export function writePreferredNotificationPlacement(placement: NotificationPlacement) {
  window.localStorage.setItem(PREFERRED_PLACEMENT_KEY, placement)
}
