import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import DataGrid from '@/components/data-grid/DataGrid'
import { GRID_IDS } from '@/components/data-grid/grid-registry'
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
  canEdit?: boolean
  canDelete?: boolean
}

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
  canEdit = true,
  canDelete = true,
}: ReportTableProps) {
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([])

  const toggleRowDetails = useCallback((rowId: string) => {
    setExpandedRowIds((current) =>
      current.includes(rowId)
        ? current.filter((id) => id !== rowId)
        : [...current, rowId],
    )
  }, [])

  const columns = useMemo<ColumnDef<Report>[]>(
    () => [
      {
        id: 'relatorio',
        header: 'Relatório',
        accessorKey: 'nome',
        enableSorting: true,
        size: 320,
        cell: ({ row }) => {
          const report = row.original

          return (
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent">
                <DashboardMaterialIcon name={report.icone} className="text-base" filled />
              </span>
              <span className="min-w-0 break-words font-medium leading-snug text-vscode-text">
                {report.nome}
              </span>
            </div>
          )
        },
      },
      {
        id: 'estado',
        header: 'Estado',
        accessorKey: 'estado',
        enableSorting: true,
        cell: ({ row }) => <ReportStatusBadges report={row.original} field="estado" />,
      },
      {
        id: 'visivel',
        header: 'Visibilidade',
        accessorKey: 'visivel',
        enableSorting: true,
        cell: ({ row }) => <ReportStatusBadges report={row.original} field="visivel" />,
      },
      {
        id: 'privacidade',
        header: 'Privacidade',
        accessorKey: 'privacidade',
        enableSorting: true,
        cell: ({ row }) => <ReportStatusBadges report={row.original} field="privacidade" />,
      },
      {
        id: 'temporario',
        header: 'Temporalidade',
        accessorKey: 'temporario',
        enableSorting: true,
        cell: ({ row }) => <ReportStatusBadges report={row.original} field="temporario" />,
      },
      {
        id: 'detalhes',
        header: 'Detalhes',
        enableSorting: false,
        enableResizing: false,
        meta: { stopRowClick: true },
        cell: ({ row }) => {
          const isExpanded = expandedRowIds.includes(row.id)

          return (
            <button
              type="button"
              onClick={() => toggleRowDetails(row.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-vscode-border px-2.5 py-1 text-xs text-vscode-text-muted transition-colors hover:border-vscode-accent/40 hover:bg-vscode-accent/10 hover:text-vscode-text focus:outline-none focus:ring-2 focus:ring-vscode-accent/40"
              aria-label={
                isExpanded ? 'Ocultar detalhes da linha' : 'Exibir detalhes da linha'
              }
            >
              {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              {isExpanded ? 'Ocultar' : 'Detalhes'}
            </button>
          )
        },
      },
      {
        id: 'acoes',
        header: 'Ações',
        enableSorting: false,
        enableResizing: false,
        meta: { lockPosition: 'end', stopRowClick: true },
        cell: ({ row }) => {
          const report = row.original

          return (
            <div className="flex items-center gap-0.5">
              <IconButton
                icon={<PencilIcon />}
                label={`Editar ${report.nome}`}
                title={
                  canEdit
                    ? 'Editar'
                    : 'Você não possui permissão para editar relatórios.'
                }
                onClick={() => onEdit(report)}
                disabled={!canEdit}
                className="h-8 w-8 rounded-full border border-vscode-border text-sky-400 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-300 disabled:opacity-40"
              />
              <IconButton
                icon={<TrashIcon />}
                label={`Excluir ${report.nome}`}
                title={
                  canDelete
                    ? 'Excluir'
                    : 'Você não possui permissão para excluir relatórios.'
                }
                onClick={() => onDelete(report)}
                disabled={!canDelete}
                className="h-8 w-8 rounded-full border border-vscode-border text-red-400 hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 disabled:opacity-40"
              />
            </div>
          )
        },
      },
    ],
    [canDelete, canEdit, expandedRowIds, onDelete, onEdit, toggleRowDetails],
  )

  if (reports.length === 0) {
    return <ReportEmptyState onClearFilters={onClearFilters} />
  }

  return (
    <DataGrid
      gridId={GRID_IDS.manageReports}
      data={reports}
      columns={columns}
      getRowId={(report) => String(report.id)}
      enableSorting
      sortingMode="client"
      renderSubRow={(report) => <ReportTableDetailsRow report={report} />}
      expandedRowIds={expandedRowIds}
    />
  )
}
