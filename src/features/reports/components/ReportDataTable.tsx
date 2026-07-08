import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import ReportDataTablePagination, {
  REPORT_DATA_PAGE_SIZE_OPTIONS,
} from '@/features/reports/components/ReportDataTablePagination'
import { formatReportCellValue } from '@/features/reports/report-cell-formatter'

const ROW_HEIGHT = 41
const TABLE_MIN_HEIGHT = 320

type ReportDataTableProps = {
  colunas: string[]
  dados: Record<string, unknown>[]
  className?: string
  hasLoaded?: boolean
  totalLinhas?: number
}

function ReportDataEmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-vscode-border bg-vscode-sidebar/50 px-6 py-16 text-center">
      <h3 className="text-base font-semibold text-vscode-text">Nenhum dado disponível</h3>
      <p className="mt-1 max-w-sm text-sm text-vscode-text-muted">{message}</p>
    </div>
  )
}

export default function ReportDataTable({
  colunas,
  dados,
  className,
  hasLoaded = true,
  totalLinhas,
}: ReportDataTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: REPORT_DATA_PAGE_SIZE_OPTIONS[1],
  })

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      colunas.map((coluna) => ({
        accessorKey: coluna,
        header: coluna,
        cell: ({ getValue }) => formatReportCellValue(getValue()),
      })),
    [colunas],
  )

  const table = useReactTable({
    data: dados,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  })

  const rows = table.getRowModel().rows

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }, [dados, colunas])

  if (!hasLoaded) {
    return (
      <ReportDataEmptyState message="Clique em Executar para carregar os resultados." />
    )
  }

  if (colunas.length === 0 || dados.length === 0) {
    return (
      <ReportDataEmptyState message="Nenhum dado retornado pela consulta." />
    )
  }

  const columnWidth = `${100 / colunas.length}%`

  return (
    <div className={clsx('flex min-h-0 flex-col gap-3', className)}>
      <ReportDataTablePagination table={table} totalLinhas={totalLinhas} />

      <div
        ref={tableContainerRef}
        className="min-h-[320px] flex-1 overflow-auto rounded-lg border border-vscode-border"
        style={{ minHeight: TABLE_MIN_HEIGHT }}
      >
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-vscode-border bg-vscode-activity-bar">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="flex w-full">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted"
                    style={{ width: columnWidth, flex: `0 0 ${columnWidth}` }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            className="relative block w-full"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              const rowClassName =
                virtualRow.index % 2 === 0 ? 'bg-vscode-sidebar' : 'bg-vscode-input-bg/30'

              return (
                <tr
                  key={row.id}
                  className={clsx('absolute left-0 top-0 flex w-full border-b border-vscode-border', rowClassName)}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const cellValue = formatReportCellValue(cell.getValue())

                    return (
                      <td
                        key={cell.id}
                        className="max-w-xs truncate px-4 py-3 text-vscode-text"
                        style={{ width: columnWidth, flex: `0 0 ${columnWidth}` }}
                        title={cellValue}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
