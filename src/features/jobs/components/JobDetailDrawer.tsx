import clsx from 'clsx'
import { useCallback, useState } from 'react'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import type { AdminJobListItem } from '@/features/jobs/jobs-types'
import { formatReportDate } from '@/features/reports/format-report-date'
import ReportJobProgress from '@/features/reports/components/ReportJobProgress'
import { downloadReportExport } from '@/features/reports/report-job-api'
import { useReportJob } from '@/features/reports/hooks/use-report-job'

type JobDetailDrawerProps = {
  job: AdminJobListItem | null
  onClose: () => void
}

function CloseIcon() {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

async function copyToClipboard(value: string): Promise<void> {
  await navigator.clipboard.writeText(value)
}

export default function JobDetailDrawer({ job, onClose }: JobDetailDrawerProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const { job: liveJob, isLoading } = useReportJob(job?.jobId ?? null, {
    enabled: Boolean(job),
  })

  const displayJob = liveJob
    ? {
        ...job!,
        status: liveJob.status,
        progress: liveJob.progress,
        errorMessage: liveJob.errorMessage,
        downloadAvailable: liveJob.downloadAvailable,
        completedAt: liveJob.completedAt,
      }
    : job

  const handleDownload = useCallback(async () => {
    if (!displayJob?.jobId) {
      return
    }

    setIsDownloading(true)

    try {
      const { blob, filename } = await downloadReportExport(displayJob.jobId)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsDownloading(false)
    }
  }, [displayJob?.jobId])

  if (!job || !displayJob) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside
        className={clsx(
          'flex h-full w-full max-w-lg flex-col border-l border-vscode-border bg-vscode-sidebar shadow-xl',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Detalhe do job"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-vscode-border px-4 py-3">
          <h3 className="text-sm font-semibold text-vscode-text">Detalhe do job</h3>
          <IconButton icon={<CloseIcon />} label="Fechar" onClick={onClose} />
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <div>
            <p className="text-xs text-vscode-text-muted">Job ID</p>
            <button
              type="button"
              className="mt-1 break-all font-mono text-xs text-vscode-accent hover:underline"
              onClick={() => void copyToClipboard(displayJob.jobId)}
            >
              {displayJob.jobId}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-vscode-text-muted">Relatório</p>
              <p className="mt-1 text-vscode-text">{displayJob.relatorioNome}</p>
            </div>
            <div>
              <p className="text-xs text-vscode-text-muted">Solicitante</p>
              <p className="mt-1 text-vscode-text">
                {displayJob.userNome || `Usuário #${displayJob.userId}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-vscode-text-muted">Criado em</p>
              <p className="mt-1 text-vscode-text">{formatReportDate(displayJob.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-vscode-text-muted">Concluído em</p>
              <p className="mt-1 text-vscode-text">
                {displayJob.completedAt ? formatReportDate(displayJob.completedAt) : '—'}
              </p>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-vscode-text-muted">Atualizando status...</p>
          ) : (
            <ReportJobProgress
              status={displayJob.status}
              progress={displayJob.progress}
              tipo={displayJob.tipo}
              errorMessage={displayJob.errorMessage}
            />
          )}

          {displayJob.errorMessage && (
            <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {displayJob.errorMessage}
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-medium text-vscode-text">Parâmetros</p>
            <pre className="max-h-48 overflow-auto rounded border border-vscode-border bg-vscode-bg/60 p-3 text-xs text-vscode-text">
              {JSON.stringify(displayJob.parametros ?? {}, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-vscode-border px-4 py-3">
          {displayJob.downloadAvailable && (
            <Button variant="primary" loading={isDownloading} onClick={() => void handleDownload()}>
              Download CSV
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </aside>
    </div>
  )
}
