import { useMemo, type ReactNode } from 'react'
import type { ColumnDef, OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table'
import clsx from 'clsx'
import DataGrid from '@/components/data-grid/DataGrid'
import type { DataGridLayoutFeatures } from '@/components/data-grid/data-grid.types'
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
  fillHeight?: boolean
  paginationPosition?: 'top' | 'bottom'
  paginationExtra?: ReactNode
  layout?: DataGridLayoutFeatures
  enableSorting?: boolean
  showPagination?: boolean
}

function ReportDataEmptyState({
  message,
  compact = false,
}: {
  message: string
  compact?: boolean
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-vscode-border bg-vscode-sidebar/50 px-6 text-center',
        compact ? 'h-full min-h-0 py-8' : 'py-16',
      )}
    >
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
  fillHeight = false,
  paginationPosition = 'top',
  paginationExtra,
  layout,
  enableSorting = true,
  showPagination = true,
}: ReportExecutionGridProps) {
  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      colunas.map((coluna) => ({
        id: coluna,
        accessorKey: coluna,
        header: coluna,
        enableSorting,
        cell: ({ getValue }) => formatReportCellValue(getValue()),
      })),
    [colunas, enableSorting],
  )

  const emptyStateClassName = fillHeight ? 'h-full min-h-0' : undefined

  if (!hasLoaded) {
    return (
      <div className={emptyStateClassName}>
        <ReportDataEmptyState
          message="Clique em Executar para carregar os resultados."
          compact={fillHeight}
        />
      </div>
    )
  }

  if (colunas.length === 0 || (dados.length === 0 && (totalLinhas ?? 0) === 0)) {
    return (
      <div className={emptyStateClassName}>
        <ReportDataEmptyState message={emptyMessage} compact={fillHeight} />
      </div>
    )
  }

  return (
    <DataGrid
      gridId={GRID_IDS.reportExecution}
      layout={layout}
      data={dados}
      columns={columns}
      paginationMode={paginationMode}
      pageIndex={pageIndex}
      pageSize={pageSize}
      pageCount={pageCount}
      totalRows={totalLinhas}
      onPaginationChange={onPaginationChange}
      enableSorting={enableSorting}
      sortingMode={enableSorting ? sortingMode : 'off'}
      sorting={sorting}
      onSortingChange={onSortingChange}
      isFetching={isFetching}
      emptyMessage={emptyMessage}
      showPagination={showPagination}
      fillHeight={fillHeight}
      paginationPosition={paginationPosition}
      paginationExtra={paginationExtra}
      className={className}
    />
  )
}
