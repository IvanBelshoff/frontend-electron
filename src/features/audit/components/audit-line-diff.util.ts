export type AuditLineDiffRow = {
  type: 'remove' | 'add' | 'context'
  lineNumber: number
  content: string
}

export type AuditChangeMode = 'create' | 'delete' | 'update'

export type AuditChangeEntry = {
  side: 'before' | 'after'
  content: string
}

export type AuditSimpleChangePanels = {
  before: string[]
  after: string[]
}

export function inferAuditChangeMode(action: string): AuditChangeMode {
  if (action.includes('.delete')) {
    return 'delete'
  }
  if (action.includes('.create')) {
    return 'create'
  }
  return 'update'
}

function pushEntry(
  entries: AuditChangeEntry[],
  side: AuditChangeEntry['side'],
  content: string,
): void {
  entries.push({ side, content })
}

export function buildChangeEntries(
  changes: Array<{
    field: string
    from: unknown | null
    to: unknown | null
    summary?: string
    added?: number[]
    removed?: number[]
  }>,
  mode: AuditChangeMode,
  getFieldLabel: (field: string) => string,
  options?: {
    multilineAsFullValues?: boolean
  },
): AuditChangeEntry[] {
  const multilineAsFullValues = options?.multilineAsFullValues ?? false
  const entries: AuditChangeEntry[] = []

  for (const change of changes) {
    const label = getFieldLabel(change.field)

    if (change.summary === 'modified' && change.field === 'query') {
      if (mode === 'delete') {
        pushEntry(entries, 'before', `${label}: [alterada]`)
      } else if (mode === 'create') {
        pushEntry(entries, 'after', `${label}: [alterada]`)
      } else {
        pushEntry(entries, 'before', `${label}: [alterada]`)
        pushEntry(entries, 'after', `${label}: [conteúdo não armazenado]`)
      }
      continue
    }

    if (change.added?.length || change.removed?.length) {
      if (mode !== 'create' && change.removed?.length) {
        pushEntry(entries, 'before', `${label}: removidos [${change.removed.join(', ')}]`)
      }
      if (mode !== 'delete' && change.added?.length) {
        pushEntry(entries, 'after', `${label}: adicionados [${change.added.join(', ')}]`)
      }
      continue
    }

    const fromText = formatAuditValue(change.from)
    const toText = formatAuditValue(change.to)

    if (mode === 'delete') {
      if (change.from != null && fromText !== '—') {
        pushEntry(entries, 'before', `${label}: ${fromText}`)
      }
      continue
    }

    if (mode === 'create') {
      if (change.to != null && toText !== '—') {
        pushEntry(entries, 'after', `${label}: ${toText}`)
      }
      continue
    }

    if (shouldUseLineDiff(change.from) || shouldUseLineDiff(change.to)) {
      if (multilineAsFullValues) {
        if (change.from != null && fromText !== '—') {
          pushEntry(entries, 'before', `${label}: ${fromText}`)
        }
        if (change.to != null && toText !== '—') {
          pushEntry(entries, 'after', `${label}: ${toText}`)
        }
        continue
      }

      const fieldRows = buildLineDiffRows(fromText, toText)
      for (const [index, row] of fieldRows.entries()) {
        const prefix = index === 0 ? `${label}: ` : ''
        pushEntry(entries, row.type === 'remove' ? 'before' : 'after', `${prefix}${row.content}`)
      }
      continue
    }

    if (change.from != null && fromText !== '—') {
      pushEntry(entries, 'before', `${label}: ${fromText}`)
    }
    if (change.to != null && toText !== '—') {
      pushEntry(entries, 'after', `${label}: ${toText}`)
    }
  }

  return entries
}

export function buildSimpleChangePanels(
  changes: Array<{
    field: string
    from: unknown | null
    to: unknown | null
    summary?: string
    added?: number[]
    removed?: number[]
  }>,
  mode: AuditChangeMode,
  getFieldLabel: (field: string) => string,
): AuditSimpleChangePanels {
  const entries = buildChangeEntries(changes, mode, getFieldLabel, {
    multilineAsFullValues: true,
  })

  return {
    before: entries.filter((entry) => entry.side === 'before').map((entry) => entry.content),
    after: entries.filter((entry) => entry.side === 'after').map((entry) => entry.content),
  }
}

export function buildUnifiedChangeRows(
  changes: Array<{
    field: string
    from: unknown | null
    to: unknown | null
    summary?: string
    added?: number[]
    removed?: number[]
  }>,
  mode: AuditChangeMode,
  getFieldLabel: (field: string) => string,
): AuditLineDiffRow[] {
  const entries = buildChangeEntries(changes, mode, getFieldLabel)
  let lineNumber = 1

  return entries.map((entry) => {
    const row: AuditLineDiffRow = {
      type: entry.side === 'before' ? 'remove' : 'add',
      lineNumber,
      content: entry.content,
    }
    lineNumber += 1
    return row
  })
}

export function buildLineDiffRows(before: string, after: string): AuditLineDiffRow[] {
  const beforeLines = before.split('\n')
  const afterLines = after.split('\n')
  const rows: AuditLineDiffRow[] = []
  let lineNumber = 1

  const maxLength = Math.max(beforeLines.length, afterLines.length)
  for (let index = 0; index < maxLength; index += 1) {
    const beforeLine = beforeLines[index]
    const afterLine = afterLines[index]

    if (beforeLine === afterLine) {
      if (beforeLine !== undefined) {
        rows.push({ type: 'context', lineNumber, content: beforeLine })
        lineNumber += 1
      }
      continue
    }

    if (beforeLine !== undefined) {
      rows.push({ type: 'remove', lineNumber, content: beforeLine })
      lineNumber += 1
    }

    if (afterLine !== undefined) {
      rows.push({ type: 'add', lineNumber, content: afterLine })
      lineNumber += 1
    }
  }

  return rows
}

export function formatAuditValue(value: unknown): string {
  if (value == null) {
    return '—'
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function shouldUseLineDiff(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false
  }

  return value.includes('\n') || value.length > 80
}
