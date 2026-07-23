import { useEffect, useState } from 'react'
import { writeDataGridStylePreference } from '@/features/settings/data-grid-style-preferences'
import { userPreferencesStore } from '@/features/settings/user-preferences-store'
import type { UserDataGridStylePreference } from '@/features/settings/user-preferences-types'

export function useDataGridStyle(): UserDataGridStylePreference {
  const [style, setStyle] = useState(userPreferencesStore.getPreferences().dataGridStyle)

  useEffect(
    () =>
      userPreferencesStore.subscribe(() => {
        setStyle(userPreferencesStore.getPreferences().dataGridStyle)
      }),
    [],
  )

  return style
}

export function useDataGridStyleActions() {
  return {
    patchDataGridStyle: writeDataGridStylePreference,
  }
}
