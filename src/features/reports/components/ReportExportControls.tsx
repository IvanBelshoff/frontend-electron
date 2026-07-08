import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import ReportJobProgress from '@/features/reports/components/ReportJobProgress'
import type { ReportJobStatusResult } from '@/features/reports/report-types'

type ReportExportControlsProps = {
  onExport: () => void
  onDownload: () => void
  isExporting: boolean
  isDownloading?: boolean
  activeJob: ReportJobStatusResult | null
  exportError?: string | null
  disabled?: boolean
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h8" />
      <path d="M8 9h2" />
    </svg>
  )
}

export default function ReportExportControls({
  onExport,
  onDownload,
  isExporting,
  isDownloading = false,
  activeJob,
  exportError,
  disabled = false,
}: ReportExportControlsProps) {
  const hasActiveJob =
    activeJob?.status === 'queued' || activeJob?.status === 'processing'
  const canDownload = activeJob?.downloadAvailable === true

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onExport}
          loading={isExporting}
          disabled={disabled || hasActiveJob}
        >
          <ExportIcon />
          Exportar CSV
        </Button>

        {canDownload && (
          <Button
            variant="primary"
            size="sm"
            onClick={onDownload}
            loading={isDownloading}
          >
            <DownloadIcon />
            Baixar CSV
          </Button>
        )}
      </div>

      {exportError && <Alert variant="error">{exportError}</Alert>}

      {activeJob && (
        <ReportJobProgress
          status={activeJob.status}
          progress={activeJob.progress}
          tipo={activeJob.tipo}
          errorMessage={activeJob.errorMessage}
        />
      )}
    </div>
  )
}
