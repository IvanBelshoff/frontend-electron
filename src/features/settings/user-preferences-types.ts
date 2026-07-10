import type { AppLanguage, ThemePreference } from '@/features/settings/settings-types'
import type {
  NotificationDisplayStyle,
  NotificationPlacement,
} from '@/features/notifications/notification-types'
import { DEFAULT_ACCENT_COLOR } from '@/features/settings/accent-colors'
import {
  DEFAULT_NOTIFICATION_PLACEMENT,
  DEFAULT_NOTIFICATION_STYLE,
} from '@/features/notifications/notification-preferences'

export type UserNotificationPreferences = {
  style: NotificationDisplayStyle
  placement: NotificationPlacement
}

export type UserPreferencesUi = {
  version: 1
  theme: ThemePreference
  accentColor: string
  notification: UserNotificationPreferences
  language: AppLanguage
}

export type UpdateUserPreferencesInput = {
  theme?: ThemePreference
  accentColor?: string
  notification?: Partial<UserNotificationPreferences>
  language?: AppLanguage
}

export const DEFAULT_USER_PREFERENCES: UserPreferencesUi = {
  version: 1,
  theme: 'system',
  accentColor: DEFAULT_ACCENT_COLOR,
  notification: {
    style: DEFAULT_NOTIFICATION_STYLE,
    placement: DEFAULT_NOTIFICATION_PLACEMENT,
  },
  language: 'pt-BR',
}
