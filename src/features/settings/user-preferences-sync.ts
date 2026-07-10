import { authStore } from '@/features/auth/auth-store'
import { notify } from '@/features/notifications/notification-api'
import { updateUserPreferences } from '@/features/settings/user-preferences-api'
import { userPreferencesStore } from '@/features/settings/user-preferences-store'
import type { UpdateUserPreferencesInput } from '@/features/settings/user-preferences-types'

let persistTimer: ReturnType<typeof setTimeout> | null = null
let pendingPatch: UpdateUserPreferencesInput = {}
let inFlight = false

function mergePendingPatch(
  current: UpdateUserPreferencesInput,
  next: UpdateUserPreferencesInput,
): UpdateUserPreferencesInput {
  return {
    ...current,
    ...next,
    notification: next.notification
      ? {
          ...current.notification,
          ...next.notification,
        }
      : current.notification,
  }
}

async function flushPendingPatch() {
  const userId = authStore.getUser()?.sub

  if (!userId || Object.keys(pendingPatch).length === 0 || inFlight) {
    return
  }

  const patch = pendingPatch
  pendingPatch = {}
  const snapshot = userPreferencesStore.getPreferences()
  inFlight = true

  try {
    const saved = await updateUserPreferences(userId, patch)
    userPreferencesStore.replace(saved)
  } catch {
    userPreferencesStore.replace(snapshot)
    notify.error('Não foi possível salvar suas preferências.')
  } finally {
    inFlight = false

    if (Object.keys(pendingPatch).length > 0) {
      void flushPendingPatch()
    }
  }
}

export function scheduleUserPreferencesPersist(patch: UpdateUserPreferencesInput) {
  userPreferencesStore.patch(patch)
  pendingPatch = mergePendingPatch(pendingPatch, patch)

  if (persistTimer) {
    clearTimeout(persistTimer)
  }

  persistTimer = setTimeout(() => {
    persistTimer = null
    void flushPendingPatch()
  }, 300)
}

export async function persistUserPreferencesNow(patch: UpdateUserPreferencesInput) {
  userPreferencesStore.patch(patch)
  pendingPatch = mergePendingPatch(pendingPatch, patch)

  if (persistTimer) {
    clearTimeout(persistTimer)
    persistTimer = null
  }

  await flushPendingPatch()
}
