export const DATA_GRID_MEASURE_FONT =
  '14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'

export const DATA_GRID_CELL_HORIZONTAL_PADDING_PX = 32

export type MeasureColumnAutoFitWidthInput = {
  headerLabel: string
  cellValues: unknown[]
  minSize?: number
  maxSize?: number
  extraPadding?: number
  measureText?: (text: string) => number
}

export function formatCellValueForMeasure(value: unknown): string {
  if (value === null || value === undefined) {
    return '—'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

let measureCanvas: HTMLCanvasElement | null = null

export function measureTextWidth(text: string, font = DATA_GRID_MEASURE_FONT): number {
  if (typeof document === 'undefined') {
    return text.length * 8
  }

  measureCanvas ??= document.createElement('canvas')
  const context = measureCanvas.getContext('2d')
  if (!context) {
    return text.length * 8
  }

  context.font = font
  return context.measureText(text).width
}

export function clampColumnAutoFitWidth(
  width: number,
  minSize = 80,
  maxSize = 800,
): number {
  return Math.min(maxSize, Math.max(minSize, width))
}

export function measureColumnAutoFitWidth({
  headerLabel,
  cellValues,
  minSize = 80,
  maxSize = 800,
  extraPadding = DATA_GRID_CELL_HORIZONTAL_PADDING_PX,
  measureText = (text) => measureTextWidth(text),
}: MeasureColumnAutoFitWidthInput): number {
  const widths = [headerLabel, ...cellValues.map(formatCellValueForMeasure)].map((text) =>
    measureText(text),
  )
  const contentWidth = widths.length > 0 ? Math.max(...widths) : 0

  return clampColumnAutoFitWidth(Math.ceil(contentWidth + extraPadding), minSize, maxSize)
}
