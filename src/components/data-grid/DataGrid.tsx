import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import DataGridPagination, {
  DATA_GRID_PAGE_SIZE_OPTIONS,
} from '@/components/data-grid/DataGridPagination'
import type { DataGridProps } from '@/components/data-grid/data-grid.types'
import { getEqualColumnWidth, shouldShowDataGridEmpty } from '@/components/data-grid/data-grid.utils'

const DEFAULT_ROW_HEIGHT = 36
const TABLE_MIN_HEIGHT = 320

function DataGridEmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-vscode-border bg-vscode-sidebar/50 px-6 py-16 text-center">
      <h3 className="text-base font-semibold text-vscode-text">Nenhum registro encontrado</h3>
      <p className="mt-1 max-w-sm text-sm text-vscode-text-muted">{message}</p>
    </div>
  )
}

function DataGridLoadingState() {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-vscode-border bg-vscode-sidebar/40">
      <span className="text-sm text-vscode-text-muted">Carregando…</span>
    </div>
  )
}

export default function DataGrid<T>({
  data,
  columns,
  getRowId,
  paginationMode = 'client',
  pageIndex: controlledPageIndex,
  pageSize: controlledPageSize,
  pageCount: controlledPageCount,
  totalRows,
  onPaginationChange,
  isLoading = false,
  isFetching = false,
  emptyMessage = 'Nenhum dado disponível.',
  onRowClick,
  rowHeight = DEFAULT_ROW_HEIGHT,
  stickyHeader = true,
  showGridLines = true,
  showPagination = false,
  className,
}: DataGridProps<T>) {
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const isServer = paginationMode === 'server'

  const [clientPagination, setClientPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DATA_GRID_PAGE_SIZE_OPTIONS[1],
  })

  const pagination: PaginationState = isServer
    ? {
        pageIndex: controlledPageIndex ?? 0,
        pageSize: controlledPageSize ?? DATA_GRID_PAGE_SIZE_OPTIONS[1],
      }
    : clientPagination

  const pageCount = isServer ? Math.max(controlledPageCount ?? 1, 1) : undefined

  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { pagination },
    onPaginationChange: isServer ? onPaginationChange : setClientPagination,
    getCoreRowModel: getCoreRowModel(),
    ...(isServer
      ? {
          manualPagination: true as const,
          pageCount,
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
        }),
    autoResetPageIndex: false,
  })

  const rows = table.getRowModel().rows
  const visibleColumnCount = table.getVisibleLeafColumns().length
  const columnWidth = getEqualColumnWidth(visibleColumnCount)

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  })

  useEffect(() => {
    if (!isServer) {
      setClientPagination((current) => ({ ...current, pageIndex: 0 }))
    }
  }, [data, columns, isServer])

  if (isLoading) {
    return <DataGridLoadingState />
  }

  if (
    shouldShowDataGridEmpty({
      isLoading,
      rowCount: data.length,
      totalRows,
    })
  ) {
    return <DataGridEmptyState message={emptyMessage} />
  }

  return (
    <div className={clsx('relative flex min-h-0 flex-col gap-3', className)}>
      {showPagination ? (
        <div className="shrink-0">
          <DataGridPagination
          table={table}
          totalRows={totalRows}
          manual={isServer}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          pageCount={pageCount}
          onPaginationChange={onPaginationChange}
          isFetching={isFetching}
        />
        </div>
      ) : null}

      <div
        ref={tableContainerRef}
        className={clsx(
          'min-h-0 flex-1 overflow-auto rounded-lg border border-vscode-border',
          isFetching && 'opacity-70',
        )}
        style={{ minHeight: TABLE_MIN_HEIGHT }}
      >
        <table
          className={clsx(
            'w-full min-w-[640px] text-left text-sm',
            showGridLines ? 'border-collapse' : 'border-separate border-spacing-0',
          )}
        >
          <thead
            className={clsx(
              'border-b border-vscode-border bg-vscode-activity-bar',
              stickyHeader && 'sticky top-0 z-10',
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="flex w-full">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted"
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
                  className={clsx(
                    'absolute left-0 top-0 flex w-full border-b border-vscode-border',
                    rowClassName,
                    onRowClick && 'cursor-pointer hover:bg-vscode-activity-bar/60',
                  )}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="truncate px-3 py-2 text-vscode-text"
                      style={{ width: columnWidth, flex: `0 0 ${columnWidth}` }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
