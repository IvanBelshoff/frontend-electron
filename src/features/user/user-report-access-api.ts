import { mapUserReportAccessListsFromApi } from '@/features/user/user-report-access-mapper'
import type { UserReportAccessListsApiRecord } from '@/features/user/user-report-access-types'
import { apiRequest } from '@/lib/api-client'

export async function getRelatoriosByUser(userId: number) {
  const data = await apiRequest<UserReportAccessListsApiRecord>(
    `/relatorios/users/${userId}`,
    { method: 'GET' },
  )

  return mapUserReportAccessListsFromApi(data)
}

export type ReportAccessGrant = {
  id: number
  permitirConhecimentoIa?: boolean
}

export async function assignUserRelatorios(
  userId: number,
  relatorios: ReportAccessGrant[],
): Promise<void> {
  await apiRequest<void>(`/user/relatorios/${userId}`, {
    method: 'PATCH',
    body: { relatorios },
  })
}
