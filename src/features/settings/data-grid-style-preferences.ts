import { scheduleUserPreferencesPersist } from '@/features/settings/user-preferences-sync'
import { userPreferencesStore } from '@/features/settings/user-preferences-store'
import {
  DEFAULT_DATA_GRID_STYLE,
  type UserDataGridStylePreference,
} from '@/features/settings/user-preferences-types'

export function getDataGridStyle(): UserDataGridStylePreference {
  return userPreferencesStore.getPreferences().dataGridStyle
}

export function writeDataGridStylePreference(patch: Partial<UserDataGridStylePreference>) {
  scheduleUserPreferencesPersist({ dataGridStyle: patch })
}

export function resetDataGridStylePreference() {
  scheduleUserPreferencesPersist({ dataGridStyle: { ...DEFAULT_DATA_GRID_STYLE } })
}

export function isDefaultDataGridStyle(style: UserDataGridStylePreference): boolean {
  return (
    style.columnLines === DEFAULT_DATA_GRID_STYLE.columnLines &&
    style.stripedRows === DEFAULT_DATA_GRID_STYLE.stripedRows &&
    style.showRowLines === DEFAULT_DATA_GRID_STYLE.showRowLines &&
    style.stickyHeader === DEFAULT_DATA_GRID_STYLE.stickyHeader
  )
}