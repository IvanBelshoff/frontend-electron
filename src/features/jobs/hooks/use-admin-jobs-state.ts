import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { listAdminJobs, listAdminScheduleExecutions } from '@/features/jobs/jobs-api'
import type {
  AdminJobListItem,
  AdminJobsFilters,
  AdminScheduleExecutionsFilters,
  JobsPageTab,
} from '@/features/jobs/jobs-types'
import type { ReportJobStatus, ReportJobTipo } from '@/features/reports/report-types'
import type { AgendamentoExecucaoStatus } from '@/features/reports/report-schedule-types'
import { queryKeys } from '@/lib/query-keys'

const DEFAULT_PAGE_SIZE = 50
const ACTIVE_JOB_POLL_MS = 5000

const DEFAULT_JOBS_FILTERS: AdminJobsFilters = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
}

const DEFAULT_SCHEDULE_FILTERS: AdminScheduleExecutionsFilters = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
}

function isActiveJobStatus(status: ReportJobStatus): boolean {
  return status === 'queued' || status === 'processing'
}

function hasActiveJobs(items: AdminJobListItem[]): boolean {
  return items.some((item) => isActiveJobStatus(item.status))
}

export function useAdminJobsState() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<JobsPageTab>('jobs')
  const [jobsFilters, setJobsFilters] = useState<AdminJobsFilters>(DEFAULT_JOBS_FILTERS)
  const [scheduleFilters, setScheduleFilters] =
    useState<AdminScheduleExecutionsFilters>(DEFAULT_SCHEDULE_FILTERS)
  const [selectedJob, setSelectedJob] = useState<AdminJobListItem | null>(null)
  const [jobIdSearch, setJobIdSearch] = useState('')

  const jobsQuery = useQuery({
    queryKey: queryKeys.adminJobs(jobsFilters as unknown as Record<string, unknown>),
    queryFn: () => listAdminJobs(jobsFilters),
    refetchInterval: (query) =>
      hasActiveJobs(query.state.data?.items ?? []) ? ACTIVE_JOB_POLL_MS : false,
  })

  const schedulesQuery = useQuery({
    queryKey: queryKeys.adminScheduleExecutions(
      scheduleFilters as unknown as Record<string, unknown>,
    ),
    queryFn: () => listAdminScheduleExecutions(scheduleFilters),
    enabled: activeTab === 'schedules',
    refetchInterval: activeTab === 'schedules' ? ACTIVE_JOB_POLL_MS : false,
  })

  const jobsTotalPages = useMemo(() => {
    const total = jobsQuery.data?.total ?? 0
    return Math.max(1, Math.ceil(total / jobsFilters.pageSize))
  }, [jobsFilters.pageSize, jobsQuery.data?.total])

  const schedulesTotalPages = useMemo(() => {
    const total = schedulesQuery.data?.total ?? 0
    return Math.max(1, Math.ceil(total / scheduleFilters.pageSize))
  }, [scheduleFilters.pageSize, schedulesQuery.data?.total])

  const setJobsStatus = useCallback((status?: ReportJobStatus) => {
    setJobsFilters((current) => ({ ...current, page: 1, status }))
  }, [])

  const setJobsTipo = useCallback((tipo?: ReportJobTipo) => {
    setJobsFilters((current) => ({ ...current, page: 1, tipo }))
  }, [])

  const setJobsRelatorioId = useCallback((relatorioId?: number) => {
    setJobsFilters((current) => ({ ...current, page: 1, relatorioId }))
  }, [])

  const setJobsDateRange = useCallback((createdFrom?: string, createdTo?: string) => {
    setJobsFilters((current) => ({ ...current, page: 1, createdFrom, createdTo }))
  }, [])

  const applyJobIdSearch = useCallback(() => {
    const trimmed = jobIdSearch.trim()
    setJobsFilters((current) => ({
      ...current,
      page: 1,
      jobId: trimmed || undefined,
    }))
  }, [jobIdSearch])

  const clearJobsFilters = useCallback(() => {
    setJobIdSearch('')
    setJobsFilters(DEFAULT_JOBS_FILTERS)
  }, [])

  const setScheduleStatus = useCallback((status?: AgendamentoExecucaoStatus) => {
    setScheduleFilters((current) => ({ ...current, page: 1, status }))
  }, [])

  const setScheduleRelatorioId = useCallback((relatorioId?: number) => {
    setScheduleFilters((current) => ({ ...current, page: 1, relatorioId }))
  }, [])

  const setScheduleDateRange = useCallback((createdFrom?: string, createdTo?: string) => {
    setScheduleFilters((current) => ({ ...current, page: 1, createdFrom, createdTo }))
  }, [])

  const goToJobsPage = useCallback((page: number) => {
    setJobsFilters((current) => ({ ...current, page }))
  }, [])

  const goToSchedulesPage = useCallback((page: number) => {
    setScheduleFilters((current) => ({ ...current, page }))
  }, [])

  const openJobDetail = useCallback((job: AdminJobListItem) => {
    setSelectedJob(job)
  }, [])

  const closeJobDetail = useCallback(() => {
    setSelectedJob(null)
  }, [])

  const refreshJobs = useCallback(() => {
    void jobsQuery.refetch()
  }, [jobsQuery])

  const refreshSchedules = useCallback(() => {
    void schedulesQuery.refetch()
  }, [schedulesQuery])

  const refreshAll = useCallback(() => {
    void jobsQuery.refetch()
    void schedulesQuery.refetch()
    void queryClient.refetchQueries({ queryKey: ['system-metrics', 'current'] })
  }, [jobsQuery, schedulesQuery, queryClient])

  const isRefreshingAll =
    (jobsQuery.isFetching && !jobsQuery.isLoading) ||
    (schedulesQuery.isFetching && !schedulesQuery.isLoading) ||
    queryClient.isFetching({ queryKey: ['system-metrics', 'current'] }) > 0

  return {
    activeTab,
    setActiveTab,
    jobs: jobsQuery.data?.items ?? [],
    jobsTotal: jobsQuery.data?.total ?? 0,
    jobsPage: jobsFilters.page,
    jobsTotalPages,
    jobsFilters,
    jobIdSearch,
    setJobIdSearch,
    applyJobIdSearch,
    setJobsStatus,
    setJobsTipo,
    setJobsRelatorioId,
    setJobsDateRange,
    clearJobsFilters,
    goToJobsPage,
    isJobsLoading: jobsQuery.isLoading,
    isJobsError: jobsQuery.isError,
    jobsError: jobsQuery.error,
    isJobsRefreshing: jobsQuery.isFetching && !jobsQuery.isLoading,
    refreshJobs,
    schedules: schedulesQuery.data?.items ?? [],
    schedulesTotal: schedulesQuery.data?.total ?? 0,
    schedulesPage: scheduleFilters.page,
    schedulesTotalPages,
    scheduleFilters,
    setScheduleStatus,
    setScheduleRelatorioId,
    setScheduleDateRange,
    goToSchedulesPage,
    isSchedulesLoading: schedulesQuery.isLoading,
    isSchedulesError: schedulesQuery.isError,
    schedulesError: schedulesQuery.error,
    isSchedulesRefreshing: schedulesQuery.isFetching && !schedulesQuery.isLoading,
    refreshSchedules,
    refreshAll,
    isRefreshingAll,
    selectedJob,
    openJobDetail,
    closeJobDetail,
    onSelectJobById: openJobDetail,
  }
}
