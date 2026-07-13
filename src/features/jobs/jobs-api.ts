import type {
  AdminJobsFilters,
  AdminJobsListResult,
  AdminScheduleExecutionsFilters,
  AdminScheduleExecutionsListResult,
} from '@/features/jobs/jobs-types'
import {
  buildAdminJobsQuery,
  buildAdminScheduleExecutionsQuery,
  mapAdminJobsResponse,
  mapAdminScheduleExecutionsResponse,
  parseTotalCount,
  type AdminJobsApiResponse,
  type AdminScheduleExecutionsApiResponse,
} from '@/features/jobs/jobs-mapper'
import { apiRequestWithResponse } from '@/lib/api-client'

export async function listAdminJobs(
  filters: AdminJobsFilters,
): Promise<AdminJobsListResult> {
  const query = buildAdminJobsQuery(filters)
  const { data, response } = await apiRequestWithResponse<AdminJobsApiResponse>(
    `/admin/jobs${query}`,
  )

  return mapAdminJobsResponse(data, parseTotalCount(response.headers.get('x-total-count')))
}

export async function listAdminScheduleExecutions(
  filters: AdminScheduleExecutionsFilters,
): Promise<AdminScheduleExecutionsListResult> {
  const query = buildAdminScheduleExecutionsQuery(filters)
  const { data, response } =
    await apiRequestWithResponse<AdminScheduleExecutionsApiResponse>(
      `/admin/jobs/schedules${query}`,
    )

  return mapAdminScheduleExecutionsResponse(
    data,
    parseTotalCount(response.headers.get('x-total-count')),
  )
}
