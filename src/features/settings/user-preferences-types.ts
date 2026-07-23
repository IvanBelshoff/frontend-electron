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



export type DataGridSortPreference = {

  id: string

  desc: boolean

}



export type DataGridLayoutPreference = {

  columnOrder?: string[]

  columnSizing?: Record<string, number>

  sorting?: DataGridSortPreference[]

}



export type DataGridColumnLinesMode = 'none' | 'header' | 'full'



export type UserDataGridStylePreference = {

  columnLines: DataGridColumnLinesMode

  stripedRows: boolean

  showRowLines: boolean

  stickyHeader: boolean

}



export const DEFAULT_DATA_GRID_STYLE: UserDataGridStylePreference = {

  columnLines: 'none',

  stripedRows: true,

  showRowLines: true,

  stickyHeader: true,

}



export type UserPreferencesUi = {

  version: 1

  theme: ThemePreference

  accentColor: string

  notification: UserNotificationPreferences

  language: AppLanguage

  dataGridStyle: UserDataGridStylePreference

  grids?: Record<string, DataGridLayoutPreference>

}



export type UpdateUserPreferencesInput = {

  theme?: ThemePreference

  accentColor?: string

  notification?: Partial<UserNotificationPreferences>

  language?: AppLanguage

  dataGridStyle?: Partial<UserDataGridStylePreference>

  grids?: Record<string, DataGridLayoutPreference>

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

  dataGridStyle: { ...DEFAULT_DATA_GRID_STYLE },

}

