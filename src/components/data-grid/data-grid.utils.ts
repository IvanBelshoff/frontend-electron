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

export function resolveDataGridColumnWidths(
  containerWidth: number,
  columnSizes: number[],
  fillWidth: boolean,
): { tableWidth: number; columnWidths: number[] } {
  const totalColumnSize = columnSizes.reduce((sum, size) => sum + size, 0)

  if (totalColumnSize <= 0) {
    return {
      tableWidth: Math.max(containerWidth, 0),
      columnWidths: columnSizes,
    }
  }

  if (!fillWidth || containerWidth <= 0) {
    return {
      tableWidth: Math.max(totalColumnSize, containerWidth),
      columnWidths: columnSizes,
    }
  }

  const tableWidth = Math.max(containerWidth, totalColumnSize)

  if (totalColumnSize >= tableWidth) {
    return { tableWidth: totalColumnSize, columnWidths: columnSizes }
  }

  const scale = tableWidth / totalColumnSize
  const columnWidths = columnSizes.map((size) => Math.floor(size * scale))
  const remainder = tableWidth - columnWidths.reduce((sum, width) => sum + width, 0)

  if (remainder > 0) {
    const largestIndex = columnSizes.indexOf(Math.max(...columnSizes))
    columnWidths[largestIndex] += remainder
  }

  return { tableWidth, columnWidths }
}
