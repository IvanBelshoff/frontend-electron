import { mapUserDashboardAccessListsFromApi } from '@/features/user/user-dashboard-access-mapper'
import type { UserDashboardAccessListsApiRecord } from '@/features/user/user-dashboard-access-types'
import { apiRequest } from '@/lib/api-client'

export async function getDashboardsByUser(userId: number) {
  const data = await apiRequest<UserDashboardAccessListsApiRecord>(
    `/dashboards/users/${userId}`,
    { method: 'GET' },
  )

  return mapUserDashboardAccessListsFromApi(data)
}

export async function assignUserDashboards(
  userId: number,
  dashboardIds: number[],
): Promise<void> {
  await apiRequest<void>(`/user/dashboards/${userId}`, {
    method: 'PATCH',
    body: { dashboards: dashboardIds },
  })
}
