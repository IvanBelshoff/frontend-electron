import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import DataGrid from '@/components/data-grid/DataGrid'
import { GRID_IDS } from '@/components/data-grid/grid-registry'
import { useAiAccess } from '@/features/ai/hooks/use-ai-access'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import FavoriteStarButton from '@/features/my-dashboards/components/FavoriteStarButton'
import MyReportEmptyState from '@/features/my-reports/components/MyReportEmptyState'
import ReportStatusBadges from '@/features/reports/components/ReportStatusBadges'
import type { Report } from '@/features/reports/report-types'

type MyReportTableProps = {
  reports: Report[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  isFavorite: (reportId: number) => boolean
  togglingFavoriteId: number | null
  onToggleFavorite: (reportId: number) => void
  onOpenReport: (relatorioId: number) => void
  onClearFilters: () => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  isLoading?: boolean
  isFetching?: boolean
}

export default function MyReportTable({
  reports,
  total,
  page,
  pageSize,
  totalPages,
  isFavorite,
  togglingFavoriteId,
  onToggleFavorite,
  onOpenReport,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  isFetching = false,
}: MyReportTableProps) {
  const { canAccessAiAssistant } = useAiAccess()

  const columns = useMemo<ColumnDef<Report>[]>(() => {
    const baseColumns: ColumnDef<Report>[] = [
      {
        id: 'favorito',
        header: 'Fav.',
        enableSorting: false,
        enableResizing: false,
        size: 56,
        meta: { stopRowClick: true },
        cell: ({ row }) => (
          <FavoriteStarButton
            isFavorite={isFavorite(row.original.id)}
            isLoading={togglingFavoriteId === row.original.id}
            label={`${isFavorite(row.original.id) ? 'Remover' : 'Adicionar'} ${row.original.nome} dos favoritos`}
            onToggle={() => onToggleFavorite(row.original.id)}
            className="h-8 w-8"
          />
        ),
      },
      {
        id: 'nome',
        header: 'Relatório',
        accessorKey: 'nome',
        enableSorting: false,
        size: 320,
        minSize: 220,
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent">
              <DashboardMaterialIcon name={row.original.icone} className="text-lg" filled />
            </span>
            <div className="min-w-0">
              <p className="min-w-0 break-words font-medium leading-snug text-vscode-text">
                {row.original.nome}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'privacidade',
        header: 'Privacidade',
        accessorKey: 'privacidade',
        enableSorting: false,
        cell: ({ row }) => <ReportStatusBadges report={row.original} field="privacidade" />,
      },
      {
        id: 'estado',
        header: 'Estado',
        accessorKey: 'estado',
        enableSorting: false,
        cell: ({ row }) => <ReportStatusBadges report={row.original} field="estado" />,
      },
      {
        id: 'temporario',
        header: 'Temporalidade',
        accessorKey: 'temporario',
        enableSorting: false,
        cell: ({ row }) => <ReportStatusBadges report={row.original} field="temporario" />,
      },
    ]

    if (canAccessAiAssistant) {
      baseColumns.push({
        id: 'ia',
        header: 'IA',
        enableSorting: false,
        cell: ({ row }) => <ReportStatusBadges report={row.original} field="ia" />,
      })
    }

    return baseColumns
  }, [canAccessAiAssistant, isFavorite, onToggleFavorite, togglingFavoriteId])

  if (!isLoading && total === 0) {
    return <MyReportEmptyState onClearFilters={onClearFilters} />
  }

  return (
    <DataGrid
      gridId={GRID_IDS.myReports}
      data={reports}
      columns={columns}
      getRowId={(row) => String(row.id)}
      paginationMode="server"
      pageIndex={page - 1}
      pageSize={pageSize}
      pageCount={totalPages}
      totalRows={total}
      onPaginationChange={(updater) => {
        const current = { pageIndex: page - 1, pageSize }
        const next = typeof updater === 'function' ? updater(current) : updater

        if (next.pageSize !== pageSize) {
          onPageSizeChange(next.pageSize)
          return
        }

        if (next.pageIndex !== page - 1) {
          onPageChange(next.pageIndex + 1)
        }
      }}
      isLoading={isLoading}
      isFetching={isFetching}
      emptyMessage="Nenhum relatório encontrado para os filtros selecionados."
      onRowClick={(report) => onOpenReport(report.id)}
      showPagination
      className="min-h-0 flex-1"
    />
  )
}
