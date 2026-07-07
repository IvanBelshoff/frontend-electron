import { normalizeRoleCatalog } from '@/features/user/user-permissions-mapper'
import type {
  RoleCatalogApiRecord,
  UpdateUserAuthenticationInput,
} from '@/features/user/user-permissions-types'
import { apiRequest } from '@/lib/api-client'

export async function listRoleCatalog() {
  const data = await apiRequest<RoleCatalogApiRecord[]>('/role', { method: 'GET' })
  return normalizeRoleCatalog(data)
}

export async function updateUserAuthentication(
  userId: number,
  input: UpdateUserAuthenticationInput,
): Promise<void> {
  await apiRequest<void>(`/user/authentication/${userId}`, {
    method: 'PATCH',
    body: input,
  })
}
