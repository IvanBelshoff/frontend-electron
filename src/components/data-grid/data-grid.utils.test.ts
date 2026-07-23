import { describe, expect, it } from 'vitest'
import {
  getEqualColumnWidth,
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
})
