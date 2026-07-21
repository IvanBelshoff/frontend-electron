import { apiRequest } from '@/lib/api-client'
import type {
  AiDashboardExploreJobStatus,
  AiDashboardExplorePlano,
} from './ai-dashboard-explore-types'

export function startDashboardDiscovery(params: {
  threadId: string
  dashboardId: number
}): Promise<{ jobId: string; status: string }> {
  return apiRequest('/ai/dashboard-explore/start-discovery', {
    method: 'POST',
    body: params,
  })
}

export function confirmDashboardAnalysis(params: {
  threadId: string
  dashboardId: number
  plano: AiDashboardExplorePlano
}): Promise<{ jobId: string; status: string }> {
  return apiRequest('/ai/dashboard-explore/confirm-analysis', {
    method: 'POST',
    body: params,
  })
}

export function getDashboardExploreJob(
  jobId: string,
): Promise<AiDashboardExploreJobStatus> {
  return apiRequest(`/ai/dashboard-explore/jobs/${jobId}`)
}
