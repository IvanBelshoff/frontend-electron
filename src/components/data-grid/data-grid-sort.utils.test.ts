import { describe, expect, it } from 'vitest'
import {
  mapApiFieldToGridColumn,
  mapGridColumnToApiField,
  serializeSortingState,
  sortingStateFromApiSort,
} from '@/components/data-grid/data-grid-sort.utils'
import { GRID_IDS } from '@/components/data-grid/grid-registry'

describe('data-grid sort utils', () => {
  it('maps grid columns to API fields', () => {
    expect(mapGridColumnToApiField(GRID_IDS.adminJobs, 'createdAt')).toBe('created_at')
    expect(mapApiFieldToGridColumn(GRID_IDS.adminJobs, 'created_at')).toBe('createdAt')
  })

  it('serializes sorting state', () => {
    expect(
      serializeSortingState([{ id: 'createdAt', desc: true }], GRID_IDS.adminJobs),
    ).toBe('created_at:desc')
  })

  it('parses api sort into sorting state', () => {
    expect(sortingStateFromApiSort('created_at:desc', GRID_IDS.adminJobs)).toEqual([
      { id: 'createdAt', desc: true },
    ])
  })
})
