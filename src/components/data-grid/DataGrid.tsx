import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import DataGridHeader from '@/components/data-grid/DataGridHeader'
import DataGridPagination, {
  DATA_GRID_PAGE_SIZE_OPTIONS,
} from '@/components/data-grid/DataGridPagination'
import type { DataGridProps } from '@/components/data-grid/data-grid.types'
import { resolveDataGridColumnWidths, shouldShowDataGridEmpty } from '@/components/data-grid/data-grid.utils'
import { resolveDataGridStyle } from '@/components/data-grid/resolve-data-grid-style'
import { useDataGridContainerWidth } from '@/components/data-grid/use-data-grid-container-width'
import { useDataGridLayout } from '@/components/data-grid/use-data-grid-layout'
import { useDataGridStyle } from '@/components/data-grid/use-data-grid-style'

const TABLE_MIN_HEIGHT = 320
const DEFAULT_COLUMN_SIZE = 160

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
  gridId,
  data,
  columns,
  getRowId,
  layout,
  paginationMode = 'client',
  pageIndex: controlledPageIndex,
  pageSize: controlledPageSize,
  pageCount: controlledPageCount,
  totalRows,
  onPaginationChange,
  enableSorting = false,
  sortingMode = 'off',
  sorting: controlledSorting,
  onSortingChange,
  isLoading = false,
  isFetching = false,
  emptyMessage = 'Nenhum dado disponível.',
  onRowClick,
  rowHeight: rowHeightProp,
  stickyHeader: stickyHeaderProp,
  showGridLines: showGridLinesProp,
  showPagination = false,
  className,
  renderSubRow,
  getRowCanExpand,
  expandedRowIds = [],
  onToggleExpanded,
  defaultColumnSize = DEFAULT_COLUMN_SIZE,
  fillWidth: fillWidthProp,
}: DataGridProps<T>) {
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const containerWidth = useDataGridContainerWidth(tableContainerRef)
  const dataGridStylePrefs = useDataGridStyle()
  const resolvedStyle = useMemo(
    () =>
      resolveDataGridStyle(dataGridStylePrefs, {
        rowHeight: rowHeightProp,
        stickyHeader: stickyHeaderProp,
        showGridLines: showGridLinesProp,
      }),
    [dataGridStylePrefs, rowHeightProp, stickyHeaderProp, showGridLinesProp],
  )
  const rowHeight = resolvedStyle.rowHeight
  const isServer = paginationMode === 'server'
  const isServerSort = sortingMode === 'server'
  const isClientSort = sortingMode === 'client'
  const columnIds = useMemo(
    () =>
      columns.map((column, index) => {
        if (column.id) {
          return column.id
        }

        if ('accessorKey' in column && typeof column.accessorKey === 'string') {
          return column.accessorKey
        }

        return `col_${index}`
      }),
    [columns],
  )

  const {
    layoutFeatures: registryLayout,
    initialColumnOrder,
    initialColumnSizing,
    initialSorting,
    onLayoutChange,
  } = useDataGridLayout(gridId, { columnIds })

  const enableColumnReorder = layout?.enableColumnReorder ?? registryLayout.enableColumnReorder
  const enableColumnResize = layout?.enableColumnResize ?? registryLayout.enableColumnResize
  const fillWidth = fillWidthProp ?? true

  const [clientPagination, setClientPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DATA_GRID_PAGE_SIZE_OPTIONS[1],
  })
  const [clientSorting, setClientSorting] = useState<SortingState>(initialSorting)
  const [columnOrder, setColumnOrder] = useState<string[]>(initialColumnOrder)
  const [columnSizing, setColumnSizing] = useState(initialColumnSizing)

  const pagination: PaginationState = isServer
    ? {
        pageIndex: controlledPageIndex ?? 0,
        pageSize: controlledPageSize ?? DATA_GRID_PAGE_SIZE_OPTIONS[1],
      }
    : clientPagination

  const sorting: SortingState =
    isServerSort && controlledSorting !== undefined ? controlledSorting : clientSorting

  const pageCount = isServer ? Math.max(controlledPageCount ?? 1, 1) : undefined

  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: {
      pagination,
      sorting,
      ...(enableColumnReorder ? { columnOrder } : {}),
      ...(enableColumnResize ? { columnSizing } : {}),
    },
    defaultColumn: {
      size: defaultColumnSize,
      minSize: 80,
      maxSize: 800,
    },
    enableColumnResizing: enableColumnResize,
    columnResizeMode: 'onChange',
    onColumnOrderChange: enableColumnReorder ? setColumnOrder : undefined,
    onColumnSizingChange: enableColumnResize ? setColumnSizing : undefined,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater

      if (isServerSort && onSortingChange) {
        onSortingChange(next)
      } else {
        setClientSorting(next)
      }
    },
    onPaginationChange: isServer ? onPaginationChange : setClientPagination,
    getCoreRowModel: getCoreRowModel(),
    ...(isClientSort ? { getSortedRowModel: getSortedRowModel() } : {}),
    ...(isServer
      ? {
          manualPagination: true as const,
          pageCount,
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
        }),
    ...(isServerSort ? { manualSorting: true as const } : {}),
    autoResetPageIndex: false,
  })

  const rows = table.getRowModel().rows

  const visibleColumns = table.getVisibleLeafColumns()
  const { tableWidth, getColumnWidth } = useMemo(() => {
    const columnSizes = visibleColumns.map((column) => column.getSize())
    const resolved = resolveDataGridColumnWidths(containerWidth, columnSizes, fillWidth)
    const widthByColumnId = new Map(
      visibleColumns.map((column, index) => [
        column.id,
        resolved.columnWidths[index] ?? column.getSize(),
      ]),
    )

    return {
      tableWidth: resolved.tableWidth,
      getColumnWidth: (columnId: string, fallback: number) =>
        widthByColumnId.get(columnId) ?? fallback,
    }
  }, [containerWidth, fillWidth, visibleColumns, columnSizing, columnOrder])

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
    measureElement: (element) => element?.getBoundingClientRect().height ?? rowHeight,
  })

  useEffect(() => {
    if (!isServer) {
      setClientPagination((current) => ({ ...current, pageIndex: 0 }))
    }
  }, [data, columns, isServer])

  useEffect(() => {
    if (!enableColumnReorder && !enableColumnResize) {
      return
    }

    onLayoutChange({
      columnOrder: enableColumnReorder ? columnOrder : columnIds,
      columnSizing: enableColumnResize ? columnSizing : {},
      sorting,
    })
  }, [
    columnIds,
    columnOrder,
    columnSizing,
    enableColumnReorder,
    enableColumnResize,
    onLayoutChange,
    sorting,
  ])

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
            resolvedStyle.showGridLines ? 'border-collapse' : 'border-separate border-spacing-0',
          )}
          style={{ width: tableWidth, minWidth: '100%' }}
        >
          <thead
            className={clsx(
              'block w-full border-b border-vscode-border bg-vscode-activity-bar',
              resolvedStyle.stickyHeader && 'sticky top-0 z-10',
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <DataGridHeader
                key={headerGroup.id}
                table={table}
                enableColumnReorder={enableColumnReorder}
                enableColumnResize={enableColumnResize}
                enableSorting={enableSorting}
                onColumnOrderChange={setColumnOrder}
                getColumnWidth={getColumnWidth}
                headerCellClass={resolvedStyle.headerCellClass}
                getHeaderColumnLineClass={resolvedStyle.getHeaderColumnLineClass}
              />
            ))}
          </thead>
          <tbody
            className="relative block w-full"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              const rowClassName = resolvedStyle.getRowBackgroundClass(virtualRow.index)
              const visibleCells = row.getVisibleCells()
              const canExpand = getRowCanExpand?.(row.original) ?? Boolean(renderSubRow)
              const isExpanded = expandedRowIds.includes(row.id)

              return (
                <Fragment key={row.id}>
                  <tr
                    ref={rowVirtualizer.measureElement}
                    data-index={virtualRow.index}
                    className={clsx(
                      'absolute left-0 top-0 flex w-full',
                      resolvedStyle.showRowLines && 'border-b border-vscode-border',
                      rowClassName,
                      onRowClick
                        ? 'cursor-pointer hover:bg-vscode-activity-bar/60'
                        : 'cursor-default select-none',
                    )}
                    style={{
                      minHeight: `${rowHeight}px`,
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {visibleCells.map((cell, cellIndex) => {
                      const columnWidth = getColumnWidth(cell.column.id, cell.column.getSize())

                      return (
                        <td
                          key={cell.id}
                          className={clsx(
                            resolvedStyle.cellClass,
                            resolvedStyle.getBodyColumnLineClass(
                              cellIndex === visibleCells.length - 1,
                            ),
                            cell.column.columnDef.meta?.truncate && 'truncate',
                          )}
                          style={{
                            width: columnWidth,
                            minWidth: columnWidth,
                            flex: `0 0 ${columnWidth}px`,
                          }}
                        title={
                          typeof cell.getValue() === 'string'
                            ? (cell.getValue() as string)
                            : undefined
                        }
                        onClick={
                          cell.column.columnDef.meta?.stopRowClick
                            ? (event) => event.stopPropagation()
                            : undefined
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                      )
                    })}
                  </tr>

                  {canExpand && isExpanded && renderSubRow ? (
                    <tr
                      className={clsx(
                        'absolute left-0 flex w-full bg-vscode-input-bg/20',
                        resolvedStyle.showRowLines && 'border-b border-vscode-border',
                      )}
                      style={{
                        transform: `translateY(${virtualRow.start + virtualRow.size}px)`,
                      }}
                    >
                      <td className="w-full px-4 py-3" colSpan={row.getVisibleCells().length}>
                        {renderSubRow(row.original)}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
