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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DataGridExpandPanel from '@/components/data-grid/DataGridExpandPanel'
import DataGridHeader from '@/components/data-grid/DataGridHeader'
import {
  DATA_GRID_DETAIL_ROW_ESTIMATE,
} from '@/components/data-grid/data-grid.constants'
import {
  DATA_GRID_CELL_HORIZONTAL_PADDING_PX,
  formatCellValueForMeasure,
  measureColumnAutoFitWidth,
} from '@/components/data-grid/data-grid-auto-fit.utils'
import { buildDataGridVirtualItems } from '@/components/data-grid/data-grid-virtual-rows'
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
  paginationPosition = 'top',
  paginationExtra,
  fillHeight = false,
  className,
  renderSubRow,
  getRowCanExpand,
  expandedRowIds = [],
  onToggleExpanded,
  defaultColumnSize = DEFAULT_COLUMN_SIZE,
  fillWidth: fillWidthProp,
  detailRowEstimate = DATA_GRID_DETAIL_ROW_ESTIMATE,
  getDetailRowEstimate,
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
  const collapsingRowIdsRef = useRef<Set<string>>(new Set())
  const [collapseEpoch, setCollapseEpoch] = useState(0)
  const prevExpandedRowIdsRef = useRef<string[]>(expandedRowIds)

  if (renderSubRow) {
    const previousExpanded = prevExpandedRowIdsRef.current
    for (const rowId of previousExpanded) {
      if (!expandedRowIds.includes(rowId)) {
        collapsingRowIdsRef.current.add(rowId)
      }
    }
    for (const rowId of expandedRowIds) {
      collapsingRowIdsRef.current.delete(rowId)
    }
  }

  prevExpandedRowIdsRef.current = expandedRowIds

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

  const detailRowIds = useMemo(() => {
    return new Set([...expandedRowIds, ...collapsingRowIdsRef.current])
  }, [expandedRowIds, collapseEpoch])

  const virtualItems = useMemo(
    () =>
      buildDataGridVirtualItems(rows, detailRowIds, {
        renderSubRow,
        getRowCanExpand,
      }),
    [rows, detailRowIds, renderSubRow, getRowCanExpand],
  )

  const rowVirtualizer = useVirtualizer({
    count: virtualItems.length,
    getScrollElement: () => tableContainerRef.current,
    getItemKey: (index) => virtualItems[index]?.key ?? index,
    estimateSize: (index) => {
      const item = virtualItems[index]
      if (item?.kind === 'detail') {
        const row = rows[item.rowIndex]
        return getDetailRowEstimate?.(row.original) ?? detailRowEstimate
      }
      return rowHeight
    },
    overscan: 10,
    ...(renderSubRow
      ? {
          measureElement: (element: Element | null) =>
            element?.getBoundingClientRect().height ?? rowHeight,
        }
      : {}),
  })

  const rowVirtualizerRef = useRef(rowVirtualizer)
  rowVirtualizerRef.current = rowVirtualizer

  useEffect(() => {
    if (!renderSubRow) {
      return
    }

    rowVirtualizerRef.current.measure()
  }, [expandedRowIds, collapseEpoch, renderSubRow])

  const remeasureVirtualizer = useCallback(() => {
    rowVirtualizerRef.current.measure()
  }, [])

  const handleCollapseEnd = useCallback((rowId: string) => {
    collapsingRowIdsRef.current.delete(rowId)
    setCollapseEpoch((current) => current + 1)
    rowVirtualizerRef.current.measure()
  }, [])

  useEffect(() => {
    collapsingRowIdsRef.current.clear()
    prevExpandedRowIdsRef.current = []
    setCollapseEpoch((current) => current + 1)
  }, [data, pagination.pageIndex, pagination.pageSize])

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

  const handleAutoFitColumn = useCallback(
    (columnId: string) => {
      const column = table.getColumn(columnId)
      if (!column) {
        return
      }

      const headerDef = column.columnDef.header
      const headerLabel = typeof headerDef === 'string' ? headerDef : columnId
      const cellValues = table.getRowModel().rows.map((row) => row.getValue(columnId))
      const headerExtraPadding =
        (enableColumnReorder ? 28 : 0) + (enableSorting && column.getCanSort() ? 16 : 0)

      const width = measureColumnAutoFitWidth({
        headerLabel,
        cellValues,
        minSize: column.columnDef.minSize ?? 80,
        maxSize: column.columnDef.maxSize ?? 800,
        extraPadding: DATA_GRID_CELL_HORIZONTAL_PADDING_PX + headerExtraPadding,
      })

      setColumnSizing((current) => ({
        ...current,
        [columnId]: width,
      }))
    },
    [enableColumnReorder, enableSorting, table],
  )

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

  const paginationBar = showPagination ? (
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
        extra={paginationExtra}
        position={paginationPosition}
      />
    </div>
  ) : null

  return (
    <div
      className={clsx(
        'relative flex min-h-0 flex-col',
        fillHeight ? 'h-full gap-0' : 'gap-3',
        className,
      )}
    >
      {showPagination && paginationPosition === 'top' ? paginationBar : null}

      <div
        ref={tableContainerRef}
        className={clsx(
          'min-h-0 flex-1 overflow-auto border border-vscode-border',
          fillHeight && paginationPosition === 'bottom' && showPagination
            ? 'rounded-t-lg border-b-0'
            : fillHeight && !showPagination
              ? 'rounded-none border-0'
              : 'rounded-lg',
          isFetching && 'opacity-70',
        )}
        style={fillHeight ? undefined : { minHeight: TABLE_MIN_HEIGHT }}
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
                onAutoFitColumn={enableColumnResize ? handleAutoFitColumn : undefined}
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
              const item = virtualItems[virtualRow.index]
              if (!item) {
                return null
              }

              if (item.kind === 'detail') {
                const row = rows[item.rowIndex]
                const isDetailExpanded = expandedRowIds.includes(item.rowId)

                return (
                  <tr
                    key={item.key}
                    ref={rowVirtualizer.measureElement}
                    data-index={virtualRow.index}
                    data-virtual-key={item.key}
                    className={clsx(
                      'absolute left-0 top-0 flex w-full bg-vscode-input-bg/20',
                      resolvedStyle.showRowLines && 'border-b border-vscode-border',
                    )}
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <td className="w-full p-0" colSpan={visibleColumns.length}>
                      <DataGridExpandPanel
                        expanded={isDetailExpanded}
                        onHeightChange={remeasureVirtualizer}
                        onCollapseEnd={() => handleCollapseEnd(item.rowId)}
                      >
                        {renderSubRow?.(row.original)}
                      </DataGridExpandPanel>
                    </td>
                  </tr>
                )
              }

              const row = rows[item.rowIndex]
              const rowClassName = resolvedStyle.getRowBackgroundClass(item.rowIndex)
              const visibleCells = row.getVisibleCells()

              return (
                <tr
                  key={item.key}
                  ref={renderSubRow ? rowVirtualizer.measureElement : undefined}
                  data-index={virtualRow.index}
                  data-virtual-key={item.key}
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
                    const shouldWrap = cell.column.columnDef.meta?.wrap
                    const cellTitle = formatCellValueForMeasure(cell.getValue())

                    return (
                      <td
                        key={cell.id}
                        className={clsx(
                          resolvedStyle.cellClass,
                          resolvedStyle.getBodyColumnLineClass(
                            cellIndex === visibleCells.length - 1,
                          ),
                          shouldWrap ? 'whitespace-normal' : 'truncate',
                        )}
                        style={{
                          width: columnWidth,
                          minWidth: columnWidth,
                          flex: `0 0 ${columnWidth}px`,
                        }}
                        title={cellTitle}
                        onClick={
                          cell.column.columnDef.meta?.stopRowClick
                            ? (event) => event.stopPropagation()
                            : undefined
                        }
                      >
                        <span
                          className={clsx(
                            'block w-full min-w-0',
                            shouldWrap ? 'whitespace-normal' : 'truncate',
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showPagination && paginationPosition === 'bottom' ? paginationBar : null}
    </div>
  )
}
