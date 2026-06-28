import { apiRequest } from '@/lib/api-client'
import type { UserDetail } from './user-types'

export async function getUserById(id: number): Promise<UserDetail> {
  return apiRequest<UserDetail>(`/user/${id}`, { method: 'GET' })
}
