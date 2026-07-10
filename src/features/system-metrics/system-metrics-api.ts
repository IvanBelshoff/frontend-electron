import type {

  SystemMetricsHistoryResponse,

  SystemMetricsLiveSnapshot,

  SystemMetricsSnapshot,

} from '@/features/system-metrics/system-metrics-types'

import { apiRequest } from '@/lib/api-client'



export async function getLiveMetrics(): Promise<SystemMetricsLiveSnapshot> {

  return apiRequest<SystemMetricsLiveSnapshot>('/admin/metrics/live')

}



export async function getCurrentMetrics(): Promise<SystemMetricsSnapshot> {

  return apiRequest<SystemMetricsSnapshot>('/admin/metrics/current')

}



export async function getMetricsHistory(

  hours = 24,

): Promise<SystemMetricsHistoryResponse> {

  return apiRequest<SystemMetricsHistoryResponse>(

    `/admin/metrics/history?hours=${hours}`,

  )

}


