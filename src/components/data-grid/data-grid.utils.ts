import type { DataGridEmptyStateInput } from '@/components/data-grid/data-grid.types'

export function shouldShowDataGridEmpty({
  isLoading,
  rowCount,
  totalRows,
}: DataGridEmptyStateInput): boolean {
  if (isLoading) {
    return false
  }

  return rowCount === 0 && (totalRows ?? 0) === 0
}

export function getEqualColumnWidth(columnCount: number): string {
  return `${100 / Math.max(columnCount, 1)}%`
}
