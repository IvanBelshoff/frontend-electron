import { describe, expect, it } from 'vitest'
import {
  buildDataGridVirtualItems,
  getDataGridDetailItemKey,
} from '@/components/data-grid/data-grid-virtual-rows'

const rows = [
  { id: 'a', original: { name: 'A' } },
  { id: 'b', original: { name: 'B' } },
  { id: 'c', original: { name: 'C' } },
]

describe('buildDataGridVirtualItems', () => {
  it('returns one data item per row when renderSubRow is undefined', () => {
    const items = buildDataGridVirtualItems(rows, new Set(), {})

    expect(items).toHaveLength(3)
    expect(items.every((item) => item.kind === 'data')).toBe(true)
    expect(items.map((item) => item.key)).toEqual(['a', 'b', 'c'])
  })

  it('inserts detail items immediately after expanded data rows', () => {
    const items = buildDataGridVirtualItems(rows, new Set(['a', 'c']), {
      renderSubRow: () => null,
    })

    expect(items).toHaveLength(5)
    expect(items.map((item) => item.key)).toEqual([
      'a',
      getDataGridDetailItemKey('a'),
      'b',
      'c',
      getDataGridDetailItemKey('c'),
    ])
  })

  it('skips detail items when getRowCanExpand returns false', () => {
    const items = buildDataGridVirtualItems(rows, new Set(['b']), {
      renderSubRow: () => null,
      getRowCanExpand: (row) => row.name !== 'B',
    })

    expect(items).toHaveLength(3)
    expect(items.map((item) => item.key)).toEqual(['a', 'b', 'c'])
  })
})
