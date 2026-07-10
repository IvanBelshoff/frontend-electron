import { useEffect, useState } from 'react'
import { userPreferencesStore } from '@/features/settings/user-preferences-store'
import type { UserPreferencesUi } from '@/features/settings/user-preferences-types'

export function useUserPreferences(): UserPreferencesUi {
  const [preferences, setPreferences] = useState(userPreferencesStore.getPreferences())

  useEffect(() => userPreferencesStore.subscribe(() => {
    setPreferences(userPreferencesStore.getPreferences())
  }), [])

  return preferences
}

export function useUserPreferencesHydrated(): boolean {
  const [hydrated, setHydrated] = useState(userPreferencesStore.isHydrated())

  useEffect(() => userPreferencesStore.subscribe(() => {
    setHydrated(userPreferencesStore.isHydrated())
  }), [])

  return hydrated
}
