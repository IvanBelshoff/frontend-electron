import type { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table'

export type DataGridProps<T> = {
  data: T[]
  columns: ColumnDef<T>[]
  getRowId?: (row: T) => string
  paginationMode?: 'client' | 'server'
  pageIndex?: number
  pageSize?: number
  pageCount?: number
  totalRows?: number
  onPaginationChange?: OnChangeFn<PaginationState>
  isLoading?: boolean
  isFetching?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
  rowHeight?: number
  stickyHeader?: boolean
  showGridLines?: boolean
  showPagination?: boolean
  className?: string
}

export type DataGridEmptyStateInput = {
  isLoading: boolean
  rowCount: number
  totalRows?: number
}
