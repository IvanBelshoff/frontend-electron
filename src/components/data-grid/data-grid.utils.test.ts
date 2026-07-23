import { describe, expect, it } from 'vitest'
import {
  getEqualColumnWidth,
  resolveDataGridColumnWidths,
  shouldShowDataGridEmpty,
} from '@/components/data-grid/data-grid.utils'

describe('data-grid utils', () => {
  it('shows empty state only when not loading and no rows', () => {
    expect(
      shouldShowDataGridEmpty({
        isLoading: false,
        rowCount: 0,
        totalRows: 0,
      }),
    ).toBe(true)

    expect(
      shouldShowDataGridEmpty({
        isLoading: true,
        rowCount: 0,
        totalRows: 0,
      }),
    ).toBe(false)

    expect(
      shouldShowDataGridEmpty({
        isLoading: false,
        rowCount: 3,
        totalRows: 100,
      }),
    ).toBe(false)
  })

  it('calculates equal column widths', () => {
    expect(getEqualColumnWidth(4)).toBe('25%')
    expect(getEqualColumnWidth(0)).toBe('100%')
  })

  it('stretches columns proportionally when fill width is enabled', () => {
    const result = resolveDataGridColumnWidths(1000, [56, 320, 160, 160], true)

    expect(result.tableWidth).toBe(1000)
    expect(result.columnWidths.reduce((sum, width) => sum + width, 0)).toBe(1000)
    expect(result.columnWidths[1]).toBeGreaterThan(320)
  })

  it('keeps column sizes when container is narrower than total column size', () => {
    const result = resolveDataGridColumnWidths(400, [200, 200, 200], true)

    expect(result.tableWidth).toBe(600)
    expect(result.columnWidths).toEqual([200, 200, 200])
  })
})
