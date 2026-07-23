import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import type { ReactNode } from 'react'
import type { GridId } from '@/components/data-grid/grid-registry'

export type DataGridLayoutFeatures = {
  enableColumnReorder?: boolean
  enableColumnResize?: boolean
}

export type DataGridProps<T> = {
  gridId: GridId
  data: T[]
  columns: ColumnDef<T>[]
  getRowId?: (row: T) => string
  layout?: DataGridLayoutFeatures
  paginationMode?: 'client' | 'server'
  pageIndex?: number
  pageSize?: number
  pageCount?: number
  totalRows?: number
  onPaginationChange?: OnChangeFn<PaginationState>
  enableSorting?: boolean
  sortingMode?: 'client' | 'server' | 'off'
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  isLoading?: boolean
  isFetching?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
  rowHeight?: number
  stickyHeader?: boolean
  showGridLines?: boolean
  showPagination?: boolean
  className?: string
  renderSubRow?: (row: T) => ReactNode
  getRowCanExpand?: (row: T) => boolean
  expandedRowIds?: string[]
  onToggleExpanded?: (rowId: string) => void
  defaultColumnSize?: number
  /** When true (default), columns expand to fill the container width when there is extra space. */
  fillWidth?: boolean
}

export type DataGridEmptyStateInput = {
  isLoading: boolean
  rowCount: number
  totalRows?: number
}

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    lockPosition?: 'end'
    stopRowClick?: boolean
    /** When true, truncates overflowing cell content with ellipsis. */
    truncate?: boolean
  }
}
