import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { getReportJobStatus } from '@/features/reports/report-job-api'
import type { ReportJobStatus } from '@/features/reports/report-types'
import { queryKeys } from '@/lib/query-keys'

const JOB_POLL_MS = 2000

export type ReportJobScope = 'report' | 'myReports'

function isActiveJobStatus(status?: ReportJobStatus): boolean {
  return status === 'queued' || status === 'processing'
}

type UseReportJobOptions = {
  enabled?: boolean
  scope?: ReportJobScope
  onCompleted?: () => void
}

export function useReportJob(jobId: string | null, options: UseReportJobOptions = {}) {
  const { enabled = true, scope = 'report', onCompleted } = options

  const jobQuery = useQuery({
    queryKey:
      scope === 'myReports'
        ? queryKeys.myReports.job(jobId ?? '')
        : queryKeys.report.job(jobId ?? ''),
    queryFn: () => getReportJobStatus(jobId!),
    enabled: enabled && Boolean(jobId),
    refetchInterval: (query) =>
      isActiveJobStatus(query.state.data?.status) ? JOB_POLL_MS : false,
  })

  const job = jobQuery.data ?? null
  const status = job?.status
  const isPolling = isActiveJobStatus(status)
  const isTerminal = status === 'completed' || status === 'failed'

  useEffect(() => {
    if (job?.status === 'completed') {
      onCompleted?.()
    }
  }, [job?.status, onCompleted])

  return useMemo(
    () => ({
      job,
      progress: job?.progress ?? 0,
      status,
      errorMessage: job?.errorMessage ?? null,
      downloadAvailable: job?.downloadAvailable ?? false,
      isLoading: jobQuery.isLoading,
      isPolling,
      isTerminal,
      isFailed: status === 'failed',
      isCompleted: status === 'completed',
    }),
    [job, jobQuery.isLoading, isPolling, isTerminal, status],
  )
}
