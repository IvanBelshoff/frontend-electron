import { describe, expect, it } from 'vitest'
import {
  clampColumnAutoFitWidth,
  formatCellValueForMeasure,
  measureColumnAutoFitWidth,
} from '@/components/data-grid/data-grid-auto-fit.utils'

describe('formatCellValueForMeasure', () => {
  it('formats null and undefined as em dash', () => {
    expect(formatCellValueForMeasure(null)).toBe('—')
    expect(formatCellValueForMeasure(undefined)).toBe('—')
  })

  it('stringifies objects', () => {
    expect(formatCellValueForMeasure({ id: 1 })).toBe('{"id":1}')
  })

  it('converts primitives to string', () => {
    expect(formatCellValueForMeasure(42)).toBe('42')
    expect(formatCellValueForMeasure('abc')).toBe('abc')
  })
})

describe('clampColumnAutoFitWidth', () => {
  it('clamps below min and above max', () => {
    expect(clampColumnAutoFitWidth(10, 80, 800)).toBe(80)
    expect(clampColumnAutoFitWidth(900, 80, 800)).toBe(800)
    expect(clampColumnAutoFitWidth(200, 80, 800)).toBe(200)
  })
})

describe('measureColumnAutoFitWidth', () => {
  const measureText = (text: string) => text.length * 10

  it('uses header width when header is widest', () => {
    expect(
      measureColumnAutoFitWidth({
        headerLabel: 'DESCRICAO_LONGA',
        cellValues: ['a', 'b'],
        extraPadding: 0,
        measureText,
      }),
    ).toBe(150)
  })

  it('uses cell width when a cell is widest', () => {
    expect(
      measureColumnAutoFitWidth({
        headerLabel: 'ID',
        cellValues: ['short', 'conteudo_muito_longo'],
        extraPadding: 0,
        measureText,
      }),
    ).toBe(200)
  })

  it('includes extra padding and respects min size', () => {
    expect(
      measureColumnAutoFitWidth({
        headerLabel: 'A',
        cellValues: [],
        extraPadding: 32,
        minSize: 80,
        measureText,
      }),
    ).toBe(80)
  })

  it('respects max size', () => {
    expect(
      measureColumnAutoFitWidth({
        headerLabel: 'x'.repeat(100),
        cellValues: [],
        extraPadding: 0,
        maxSize: 120,
        measureText,
      }),
    ).toBe(120)
  })
})
