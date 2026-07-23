import { useMemo } from 'react'
import type { ColumnDef, OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table'
import DataGrid from '@/components/data-grid/DataGrid'
import { GRID_IDS } from '@/components/data-grid/grid-registry'
import { formatReportCellValue } from '@/features/reports/report-cell-formatter'

type ReportExecutionGridProps = {
  colunas: string[]
  dados: Record<string, unknown>[]
  className?: string
  hasLoaded?: boolean
  totalLinhas?: number
  paginationMode?: 'client' | 'server'
  pageIndex?: number
  pageSize?: number
  pageCount?: number
  onPaginationChange?: OnChangeFn<PaginationState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  sortingMode?: 'client' | 'server'
  isFetching?: boolean
  emptyMessage?: string
}

function ReportDataEmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-vscode-border bg-vscode-sidebar/50 px-6 py-16 text-center">
      <h3 className="text-base font-semibold text-vscode-text">Nenhum dado disponível</h3>
      <p className="mt-1 max-w-sm text-sm text-vscode-text-muted">{message}</p>
    </div>
  )
}

export default function ReportExecutionGrid({
  colunas,
  dados,
  className,
  hasLoaded = true,
  totalLinhas,
  paginationMode = 'client',
  pageIndex,
  pageSize,
  pageCount,
  onPaginationChange,
  sorting,
  onSortingChange,
  sortingMode = 'client',
  isFetching = false,
  emptyMessage = 'Nenhum dado retornado pela consulta.',
}: ReportExecutionGridProps) {
  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      colunas.map((coluna) => ({
        id: coluna,
        accessorKey: coluna,
        header: coluna,
        enableSorting: true,
        cell: ({ getValue }) => formatReportCellValue(getValue()),
      })),
    [colunas],
  )

  if (!hasLoaded) {
    return (
      <ReportDataEmptyState message="Clique em Executar para carregar os resultados." />
    )
  }

  if (colunas.length === 0 || (dados.length === 0 && (totalLinhas ?? 0) === 0)) {
    return <ReportDataEmptyState message={emptyMessage} />
  }

  return (
    <DataGrid
      gridId={GRID_IDS.reportExecution}
      data={dados}
      columns={columns}
      paginationMode={paginationMode}
      pageIndex={pageIndex}
      pageSize={pageSize}
      pageCount={pageCount}
      totalRows={totalLinhas}
      onPaginationChange={onPaginationChange}
      enableSorting
      sortingMode={sortingMode}
      sorting={sorting}
      onSortingChange={onSortingChange}
      isFetching={isFetching}
      emptyMessage={emptyMessage}
      showPagination
      className={className}
    />
  )
}
