import { scheduleUserPreferencesPersist } from '@/features/settings/user-preferences-sync'
import { userPreferencesStore } from '@/features/settings/user-preferences-store'
import type { NotificationDisplayStyle, NotificationPlacement } from './notification-types'

export const DEFAULT_NOTIFICATION_STYLE: NotificationDisplayStyle = 'circularProgress'
export const DEFAULT_NOTIFICATION_PLACEMENT: NotificationPlacement = 'bottom-right'

export function getNotificationStyle(): NotificationDisplayStyle {
  return userPreferencesStore.getPreferences().notification.style
}

export function getNotificationPlacement(): NotificationPlacement {
  return userPreferencesStore.getPreferences().notification.placement
}

export function writePreferredNotificationStyle(style: NotificationDisplayStyle) {
  scheduleUserPreferencesPersist({ notification: { style } })
}

export function writePreferredNotificationPlacement(placement: NotificationPlacement) {
  scheduleUserPreferencesPersist({ notification: { placement } })
}
