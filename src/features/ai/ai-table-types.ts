export type AiTableColumn = {
  key: string
  label: string
  align?: 'left' | 'right'
}

export type AiTableRowValue = string | number | null

export type AiTableSpec = {
  title: string
  subtitle?: string
  columns: AiTableColumn[]
  rows: Record<string, AiTableRowValue>[]
  source?: string
  footnote?: string
  truncado?: boolean
}

export function parseAiTableSpec(value: unknown): AiTableSpec | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const candidate = value as Partial<AiTableSpec>

  if (typeof candidate.title !== 'string' || !candidate.title) {
    return null
  }

  if (!Array.isArray(candidate.columns) || candidate.columns.length === 0) {
    return null
  }

  if (!Array.isArray(candidate.rows) || candidate.rows.length === 0) {
    return null
  }

  const columnsValid = candidate.columns.every(
    (column) =>
      typeof column === 'object' &&
      column !== null &&
      typeof column.key === 'string' &&
      typeof column.label === 'string',
  )

  if (!columnsValid) {
    return null
  }

  return candidate as AiTableSpec
}
