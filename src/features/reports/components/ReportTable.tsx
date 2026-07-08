import clsx from 'clsx'
import { Fragment, useCallback, useState } from 'react'
import IconButton from '@/components/ui/IconButton'
import ReportEmptyState from '@/features/reports/components/ReportEmptyState'
import ReportStatusBadges from '@/features/reports/components/ReportStatusBadges'
import type { Report } from '@/features/reports/report-types'
import { formatReportDate } from '@/features/reports/format-report-date'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DashboardMaterialIcon,
  PencilIcon,
  TrashIcon,
} from '@/features/dashboards/icons/DashboardIcons'

type ReportTableProps = {
  reports: Report[]
  onEdit: (report: Report) => void
  onDelete: (report: Report) => void
  onClearFilters: () => void
}

const TABLE_COLUMN_COUNT = 7

function ReportTableDetailsRow({ report }: { report: Report }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-2 text-xs text-vscode-text-muted sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2">
      <p className="min-w-0 break-words">
        <strong className="font-semibold text-vscode-text-muted">Conexão:</strong>{' '}
        {report.conexao?.nome ?? 'Não informado'}
      </p>
      <p className="min-w-0 break-words">
        <strong className="font-semibold text-vscode-text-muted">Criado por:</strong>{' '}
        {report.usuarioCadastrador || 'Não informado'}
      </p>
      <p className="min-w-0 break-words">
        <strong className="font-semibold text-vscode-text-muted">Data de criação:</strong>{' '}
        {formatReportDate(report.dataCriacao)}
      </p>
      <p className="min-w-0 break-words">
        <strong className="font-semibold text-vscode-text-muted">Atualizado por:</strong>{' '}
        {report.usuarioAtualizador || 'Não informado'}
      </p>
      <p className="min-w-0 break-words">
        <strong className="font-semibold text-vscode-text-muted">Data de atualização:</strong>{' '}
        {formatReportDate(report.dataAtualizacao)}
      </p>
    </div>
  )
}

export default function ReportTable({
  reports,
  onEdit,
  onDelete,
  onClearFilters,
}: ReportTableProps) {
  const [expandedRowIds, setExpandedRowIds] = useState<number[]>([])

  const toggleRowDetails = useCallback((reportId: number) => {
    setExpandedRowIds((current) =>
      current.includes(reportId)
        ? current.filter((id) => id !== reportId)
        : [...current, reportId],
    )
  }, [])

  if (reports.length === 0) {
    return <ReportEmptyState onClearFilters={onClearFilters} />
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-vscode-border">
      <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-vscode-border bg-vscode-activity-bar">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Relatório
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Estado
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Visibilidade
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Privacidade
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Temporalidade
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Detalhes
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => {
            const isExpanded = expandedRowIds.includes(report.id)
            const rowClassName = index % 2 === 0 ? 'bg-vscode-sidebar' : 'bg-vscode-input-bg/30'

            return (
              <Fragment key={report.id}>
                <tr className={clsx('border-b border-vscode-border', rowClassName)}>
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent">
                        <DashboardMaterialIcon name={report.icone} className="text-base" filled />
                      </span>
                      <span className="truncate font-medium text-vscode-text" title={report.nome}>
                        {report.nome}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ReportStatusBadges report={report} field="estado" />
                  </td>
                  <td className="px-4 py-3">
                    <ReportStatusBadges report={report} field="visivel" />
                  </td>
                  <td className="px-4 py-3">
                    <ReportStatusBadges report={report} field="privacidade" />
                  </td>
                  <td className="px-4 py-3">
                    <ReportStatusBadges report={report} field="temporario" />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleRowDetails(report.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-vscode-border px-2.5 py-1 text-xs text-vscode-text-muted transition-colors hover:border-vscode-accent/40 hover:bg-vscode-accent/10 hover:text-vscode-text focus:outline-none focus:ring-2 focus:ring-vscode-accent/40"
                      aria-label={
                        isExpanded ? 'Ocultar detalhes da linha' : 'Exibir detalhes da linha'
                      }
                    >
                      {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      {isExpanded ? 'Ocultar' : 'Detalhes'}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      <IconButton
                        icon={<PencilIcon />}
                        label={`Editar ${report.nome}`}
                        title="Editar"
                        onClick={() => onEdit(report)}
                        className="h-8 w-8 rounded-full border border-vscode-border text-sky-400 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-300"
                      />
                      <IconButton
                        icon={<TrashIcon />}
                        label={`Excluir ${report.nome}`}
                        title="Excluir"
                        onClick={() => onDelete(report)}
                        className="h-8 w-8 rounded-full border border-vscode-border text-red-400 hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
                      />
                    </div>
                  </td>
                </tr>

                {isExpanded && (
                  <tr className={clsx('border-b border-vscode-border', rowClassName)}>
                    <td colSpan={TABLE_COLUMN_COUNT} className="px-4 py-3">
                      <ReportTableDetailsRow report={report} />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
