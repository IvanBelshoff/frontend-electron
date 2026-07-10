import type {
  UpdateUserPreferencesInput,
  UserPreferencesUi,
} from '@/features/settings/user-preferences-types'
import { apiRequest } from '@/lib/api-client'

export async function updateUserPreferences(
  userId: number,
  patch: UpdateUserPreferencesInput,
): Promise<UserPreferencesUi> {
  return apiRequest<UserPreferencesUi>(`/user/preferences/${userId}`, {
    method: 'PATCH',
    body: patch,
  })
}
