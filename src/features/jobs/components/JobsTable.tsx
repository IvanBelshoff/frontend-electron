import { Link } from '@tanstack/react-router'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { AdminJobListItem } from '@/features/jobs/jobs-types'
import { formatReportDate } from '@/features/reports/format-report-date'
import ReportJobProgress from '@/features/reports/components/ReportJobProgress'
import type { ReportJobStatus, ReportJobTipo } from '@/features/reports/report-types'

type JobsTableProps = {
  jobs: AdminJobListItem[]
  isLoading?: boolean
  onViewDetail: (job: AdminJobListItem) => void
  onDownload: (jobId: string) => void
  isDownloading?: boolean
  downloadingJobId?: string | null
}

function tipoBadge(tipo: ReportJobTipo) {
  if (tipo === 'export_csv') {
    return <Badge variant="info">Export CSV</Badge>
  }

  return <Badge variant="neutral">Snapshot</Badge>
}

function origemBadge(origem: AdminJobListItem['origem']) {
  if (origem === 'agendado') {
    return <Badge variant="warning">Agendado</Badge>
  }

  return <Badge variant="neutral">Manual</Badge>
}

function statusBadgeVariant(
  status: ReportJobStatus,
): 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'completed':
      return 'success'
    case 'failed':
      return 'danger'
    case 'processing':
    case 'queued':
      return 'warning'
    default:
      return 'neutral'
  }
}

function statusLabel(status: ReportJobStatus): string {
  switch (status) {
    case 'queued':
      return 'Na fila'
    case 'processing':
      return 'Processando'
    case 'completed':
      return 'Concluído'
    case 'failed':
      return 'Falhou'
    default:
      return status
  }
}

export default function JobsTable({
  jobs,
  isLoading = false,
  onViewDetail,
  onDownload,
  isDownloading = false,
  downloadingJobId = null,
}: JobsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-vscode-border px-6 py-12 text-sm text-vscode-text-muted">
        Carregando jobs...
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-vscode-border bg-vscode-sidebar/40 px-6 py-12 text-sm text-vscode-text-muted">
        Nenhum job encontrado para os filtros selecionados.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-vscode-border">
      <table className="min-w-full divide-y divide-vscode-border text-sm">
        <thead className="bg-vscode-sidebar/60">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Tipo</th>
            <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Relatório</th>
            <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Solicitante</th>
            <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Origem</th>
            <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Status</th>
            <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Progresso</th>
            <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Criado em</th>
            <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Concluído em</th>
            <th className="px-4 py-3 text-left font-medium text-vscode-text-muted">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-vscode-border bg-vscode-bg/40">
          {jobs.map((job) => (
            <tr key={job.jobId}>
              <td className="px-4 py-3">{tipoBadge(job.tipo)}</td>
              <td className="px-4 py-3">
                <Link
                  to="/relatorios/$relatorioId/editar"
                  params={{ relatorioId: String(job.relatorioId) }}
                  className="text-vscode-accent hover:underline"
                >
                  {job.relatorioNome}
                </Link>
              </td>
              <td className="px-4 py-3 text-vscode-text">{job.userNome || `Usuário #${job.userId}`}</td>
              <td className="px-4 py-3">{origemBadge(job.origem)}</td>
              <td className="px-4 py-3">
                <Badge variant={statusBadgeVariant(job.status)}>{statusLabel(job.status)}</Badge>
              </td>
              <td className="min-w-[180px] px-4 py-3">
                {job.status === 'processing' || job.status === 'queued' ? (
                  <ReportJobProgress
                    status={job.status}
                    progress={job.progress}
                    tipo={job.tipo}
                    errorMessage={job.errorMessage}
                  />
                ) : (
                  <span className="text-vscode-text-muted">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-vscode-text">{formatReportDate(job.createdAt)}</td>
              <td className="px-4 py-3 text-vscode-text">
                {job.completedAt ? formatReportDate(job.completedAt) : '—'}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => onViewDetail(job)}>
                    Detalhe
                  </Button>
                  {job.downloadAvailable && (
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={isDownloading && downloadingJobId === job.jobId}
                      onClick={() => onDownload(job.jobId)}
                    >
                      Download
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
