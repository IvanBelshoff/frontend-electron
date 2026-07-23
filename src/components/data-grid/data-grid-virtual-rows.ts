import type { ReactNode } from 'react'

export type DataGridVirtualItem =
  | { kind: 'data'; rowIndex: number; rowId: string; key: string }
  | { kind: 'detail'; rowIndex: number; rowId: string; key: string }

export function getDataGridDetailItemKey(rowId: string): string {
  return `${rowId}__detail`
}

type BuildDataGridVirtualItemsOptions<T> = {
  renderSubRow?: (row: T) => ReactNode
  getRowCanExpand?: (row: T) => boolean
}

export function buildDataGridVirtualItems<T>(
  rows: Array<{ id: string; original: T }>,
  detailRowIds: ReadonlySet<string>,
  options: BuildDataGridVirtualItemsOptions<T>,
): DataGridVirtualItem[] {
  if (!options.renderSubRow) {
    return rows.map((row, rowIndex) => ({
      kind: 'data',
      rowIndex,
      rowId: row.id,
      key: row.id,
    }))
  }

  const items: DataGridVirtualItem[] = []

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex]
    const canExpand = options.getRowCanExpand?.(row.original) ?? true

    items.push({
      kind: 'data',
      rowIndex,
      rowId: row.id,
      key: row.id,
    })

    if (canExpand && detailRowIds.has(row.id)) {
      items.push({
        kind: 'detail',
        rowIndex,
        rowId: row.id,
        key: getDataGridDetailItemKey(row.id),
      })
    }
  }

  return items
}
