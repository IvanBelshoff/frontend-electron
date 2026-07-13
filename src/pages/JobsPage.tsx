import clsx from 'clsx'
import { useCallback, useState } from 'react'
import SettingsPageHeader from '@/components/settings/SettingsPageHeader'
import { RefreshIcon } from '@/components/settings/SettingsIcons'
import Alert from '@/components/ui/Alert'
import IconButton from '@/components/ui/IconButton'
import JobDetailDrawer from '@/features/jobs/components/JobDetailDrawer'
import JobsTable from '@/features/jobs/components/JobsTable'
import JobsToolbar from '@/features/jobs/components/JobsToolbar'
import QueueHealthWidget from '@/features/jobs/components/QueueHealthWidget'
import ScheduledExecutionsTable from '@/features/jobs/components/ScheduledExecutionsTable'
import { useAdminJobsState } from '@/features/jobs/hooks/use-admin-jobs-state'
import type { AdminJobListItem } from '@/features/jobs/jobs-types'
import { ApiError } from '@/features/auth/auth-types'
import MyReportPagination from '@/features/my-reports/components/MyReportPagination'
import { downloadReportExport } from '@/features/reports/report-job-api'

type JobsTabButtonProps = {
  active: boolean
  label: string
  onClick: () => void
}

function JobsTabButton({ active, label, onClick }: JobsTabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded px-3 py-1.5 text-sm transition-colors',
        active
          ? 'bg-vscode-accent/15 text-vscode-accent'
          : 'text-vscode-text-muted hover:bg-vscode-activity-bar hover:text-vscode-text',
      )}
    >
      {label}
    </button>
  )
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export default function JobsPage() {
  const {
    activeTab,
    setActiveTab,
    jobs,
    jobsTotal,
    jobsPage,
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
    isJobsLoading,
    isJobsError,
    jobsError,
    isJobsRefreshing,
    refreshJobs,
    schedules,
    schedulesTotal,
    schedulesPage,
    schedulesTotalPages,
    scheduleFilters,
    setScheduleStatus,
    setScheduleRelatorioId,
    setScheduleDateRange,
    goToSchedulesPage,
    isSchedulesLoading,
    isSchedulesError,
    schedulesError,
    isSchedulesRefreshing,
    refreshSchedules,
    refreshAll,
    isRefreshingAll,
    selectedJob,
    openJobDetail,
    closeJobDetail,
  } = useAdminJobsState()

  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = useCallback(async (jobId: string) => {
    setDownloadingJobId(jobId)
    setIsDownloading(true)

    try {
      const { blob, filename } = await downloadReportExport(jobId)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsDownloading(false)
      setDownloadingJobId(null)
    }
  }, [])

  const handleSelectJobFromSchedule = useCallback(
    (jobId: string) => {
      const jobFromList = jobs.find((item) => item.jobId === jobId)

      if (jobFromList) {
        openJobDetail(jobFromList)
        return
      }

      const stubJob: AdminJobListItem = {
        jobId,
        tipo: 'snapshot',
        status: 'completed',
        progress: 100,
        relatorioId: 0,
        relatorioNome: '—',
        userId: 0,
        userNome: '—',
        errorMessage: null,
        downloadAvailable: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
        origem: 'agendado',
        parametros: {},
      }

      openJobDetail(stubJob)
    },
    [jobs, openJobDetail],
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
        <SettingsPageHeader
          title="Jobs / Pipelines"
          subtitle="Acompanhe snapshots, exports CSV, execuções agendadas e saúde das filas."
        />
        <IconButton
          icon={
            isRefreshingAll ? (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                aria-hidden="true"
              />
            ) : (
              <RefreshIcon />
            )
          }
          label="Atualizar jobs"
          title="Atualizar"
          onClick={refreshAll}
          disabled={isRefreshingAll}
        />
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pt-6">
        <QueueHealthWidget />

        <div className="flex flex-wrap gap-2">
          <JobsTabButton
            active={activeTab === 'jobs'}
            label="Jobs de trabalho"
            onClick={() => setActiveTab('jobs')}
          />
          <JobsTabButton
            active={activeTab === 'schedules'}
            label="Execuções agendadas"
            onClick={() => setActiveTab('schedules')}
          />
        </div>

        {activeTab === 'jobs' ? (
          <div className="space-y-4">
            <JobsToolbar
              filters={jobsFilters}
              jobIdSearch={jobIdSearch}
              onJobIdSearchChange={setJobIdSearch}
              onApplyJobIdSearch={applyJobIdSearch}
              onStatusChange={setJobsStatus}
              onTipoChange={setJobsTipo}
              onRelatorioIdChange={setJobsRelatorioId}
              onDateRangeChange={setJobsDateRange}
              onClearFilters={clearJobsFilters}
              onRefresh={refreshJobs}
              isRefreshing={isJobsRefreshing}
              total={jobsTotal}
            />

            {isJobsError ? (
              <Alert variant="error">
                {getErrorMessage(jobsError, 'Não foi possível carregar os jobs.')}
              </Alert>
            ) : (
              <>
                <JobsTable
                  jobs={jobs}
                  isLoading={isJobsLoading}
                  onViewDetail={openJobDetail}
                  onDownload={(jobId) => void handleDownload(jobId)}
                  isDownloading={isDownloading}
                  downloadingJobId={downloadingJobId}
                />

                {jobsTotalPages > 1 && (
                  <MyReportPagination
                    page={jobsPage}
                    totalPages={jobsTotalPages}
                    onPrevious={() => goToJobsPage(Math.max(1, jobsPage - 1))}
                    onNext={() => goToJobsPage(Math.min(jobsTotalPages, jobsPage + 1))}
                  />
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {isSchedulesError ? (
              <Alert variant="error">
                {getErrorMessage(
                  schedulesError,
                  'Não foi possível carregar as execuções agendadas.',
                )}
              </Alert>
            ) : (
              <>
                <ScheduledExecutionsTable
                  executions={schedules}
                  filters={scheduleFilters}
                  isLoading={isSchedulesLoading}
                  isRefreshing={isSchedulesRefreshing}
                  total={schedulesTotal}
                  onStatusChange={setScheduleStatus}
                  onRelatorioIdChange={setScheduleRelatorioId}
                  onDateRangeChange={setScheduleDateRange}
                  onRefresh={refreshSchedules}
                  onSelectJob={handleSelectJobFromSchedule}
                />

                {schedulesTotalPages > 1 && (
                  <MyReportPagination
                    page={schedulesPage}
                    totalPages={schedulesTotalPages}
                    onPrevious={() => goToSchedulesPage(Math.max(1, schedulesPage - 1))}
                    onNext={() =>
                      goToSchedulesPage(Math.min(schedulesTotalPages, schedulesPage + 1))
                    }
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      <JobDetailDrawer job={selectedJob} onClose={closeJobDetail} />
    </div>
  )
}
