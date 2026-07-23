import {
  DEFAULT_DATA_GRID_STYLE,
  DEFAULT_USER_PREFERENCES,
  type DataGridLayoutPreference,
  type UpdateUserPreferencesInput,
  type UserPreferencesUi,
} from '@/features/settings/user-preferences-types'

type PreferencesListener = () => void

const LEGACY_STORAGE_KEYS = [
  'datadash.theme',
  'datadash.accentColor',
  'datadash.notification.preferredStyle',
  'datadash.notification.preferredPlacement',
  'datadash.language',
] as const

let preferences: UserPreferencesUi = { ...DEFAULT_USER_PREFERENCES }
let hydrated = false
const listeners = new Set<PreferencesListener>()

function notify() {
  listeners.forEach((listener) => listener())
}

function clearLegacyStorage() {
  if (typeof window === 'undefined') {
    return
  }

  for (const key of LEGACY_STORAGE_KEYS) {
    window.localStorage.removeItem(key)
  }
}

function mergeGridLayoutPreference(
  current: DataGridLayoutPreference | undefined,
  patch: DataGridLayoutPreference,
): DataGridLayoutPreference {
  return {
    columnOrder: patch.columnOrder ?? current?.columnOrder,
    columnSizing: {
      ...current?.columnSizing,
      ...patch.columnSizing,
    },
    sorting: patch.sorting ?? current?.sorting,
  }
}

function mergeGridLayouts(
  current: Record<string, DataGridLayoutPreference> | undefined,
  patch: Record<string, DataGridLayoutPreference>,
): Record<string, DataGridLayoutPreference> {
  const merged: Record<string, DataGridLayoutPreference> = {
    ...current,
  }

  for (const [gridId, gridPatch] of Object.entries(patch)) {
    merged[gridId] = mergeGridLayoutPreference(current?.[gridId], gridPatch)
  }

  return merged
}

function mergePreferences(
  current: UserPreferencesUi,
  patch: UpdateUserPreferencesInput,
): UserPreferencesUi {
  return {
    version: 1,
    theme: patch.theme ?? current.theme,
    accentColor: patch.accentColor ?? current.accentColor,
    language: patch.language ?? current.language,
    notification: {
      style: patch.notification?.style ?? current.notification.style,
      placement: patch.notification?.placement ?? current.notification.placement,
    },
    dataGridStyle: {
      columnLines: patch.dataGridStyle?.columnLines ?? current.dataGridStyle.columnLines,
      stripedRows: patch.dataGridStyle?.stripedRows ?? current.dataGridStyle.stripedRows,
      showRowLines: patch.dataGridStyle?.showRowLines ?? current.dataGridStyle.showRowLines,
      stickyHeader: patch.dataGridStyle?.stickyHeader ?? current.dataGridStyle.stickyHeader,
    },
    grids:
      patch.grids !== undefined ? mergeGridLayouts(current.grids, patch.grids) : current.grids,
  }
}

export const userPreferencesStore = {
  getPreferences: () => preferences,
  isHydrated: () => hydrated,
  hydrate: (next: UserPreferencesUi | null | undefined) => {
    preferences = next
      ? {
          ...DEFAULT_USER_PREFERENCES,
          ...next,
          notification: {
            ...DEFAULT_USER_PREFERENCES.notification,
            ...next.notification,
          },
          dataGridStyle: {
            ...DEFAULT_DATA_GRID_STYLE,
            ...next.dataGridStyle,
          },
          grids: next.grids ? { ...next.grids } : undefined,
        }
      : { ...DEFAULT_USER_PREFERENCES }
    hydrated = true
    clearLegacyStorage()
    notify()
  },
  patch: (patch: UpdateUserPreferencesInput) => {
    preferences = mergePreferences(preferences, patch)
    notify()
  },
  replace: (next: UserPreferencesUi) => {
    preferences = {
      ...DEFAULT_USER_PREFERENCES,
      ...next,
      notification: {
        ...DEFAULT_USER_PREFERENCES.notification,
        ...next.notification,
      },
      dataGridStyle: {
        ...DEFAULT_DATA_GRID_STYLE,
        ...next.dataGridStyle,
      },
      grids: next.grids ? { ...next.grids } : undefined,
    }
    notify()
  },
  clear: () => {
    preferences = { ...DEFAULT_USER_PREFERENCES }
    hydrated = false
    notify()
  },
  subscribe: (listener: PreferencesListener) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
