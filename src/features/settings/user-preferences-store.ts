import {
  DEFAULT_USER_PREFERENCES,
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
