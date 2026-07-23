import { describe, expect, it } from 'vitest'
import { DATA_GRID_ROW_MIN_HEIGHT } from '@/components/data-grid/data-grid.constants'
import { resolveDataGridStyle } from '@/components/data-grid/resolve-data-grid-style'
import { DEFAULT_DATA_GRID_STYLE } from '@/features/settings/user-preferences-types'

describe('resolveDataGridStyle', () => {
  it('returns defaults when preferences are empty', () => {
    const resolved = resolveDataGridStyle()

    expect(resolved.rowHeight).toBe(DATA_GRID_ROW_MIN_HEIGHT)
    expect(resolved.stripedRows).toBe(true)
    expect(resolved.showRowLines).toBe(true)
    expect(resolved.stickyHeader).toBe(true)
    expect(resolved.getHeaderColumnLineClass(false)).toBe('')
  })

  it('applies column lines only on header when configured', () => {    const resolved = resolveDataGridStyle({
      ...DEFAULT_DATA_GRID_STYLE,
      columnLines: 'header',
    })

    expect(resolved.getHeaderColumnLineClass(false)).toBe('border-r border-vscode-border')
    expect(resolved.getBodyColumnLineClass(false)).toBe('')
  })

  it('applies column lines on header and body when full', () => {
    const resolved = resolveDataGridStyle({
      ...DEFAULT_DATA_GRID_STYLE,
      columnLines: 'full',
    })

    expect(resolved.getBodyColumnLineClass(false)).toBe('border-r border-vscode-border')
  })

  it('applies zebra rows when stripedRows is enabled', () => {
    const resolved = resolveDataGridStyle({
      ...DEFAULT_DATA_GRID_STYLE,
      stripedRows: true,
    })

    expect(resolved.getRowBackgroundClass(0)).toBe('bg-vscode-sidebar')
    expect(resolved.getRowBackgroundClass(1)).toBe('bg-vscode-activity-bar/50')
  })

  it('disables zebra rows when stripedRows is false', () => {
    const resolved = resolveDataGridStyle({
      ...DEFAULT_DATA_GRID_STYLE,
      stripedRows: false,
    })

    expect(resolved.getRowBackgroundClass(0)).toBe('bg-vscode-sidebar')
    expect(resolved.getRowBackgroundClass(1)).toBe('bg-vscode-sidebar')
  })

  it('prefers explicit prop overrides', () => {
    const resolved = resolveDataGridStyle(DEFAULT_DATA_GRID_STYLE, {
      rowHeight: 72,
      stickyHeader: false,
    })

    expect(resolved.rowHeight).toBe(72)
    expect(resolved.stickyHeader).toBe(false)
  })
})
