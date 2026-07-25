const SELECT_PATTERN = /\bSELECT\b/i

export function queryHasSelect(sql: string): boolean {
  return SELECT_PATTERN.test(sql.trim())
}

export function buildTableInsertSnippet(
  currentQuery: string,
  qualifiedTable: string,
): string {
  if (queryHasSelect(currentQuery)) {
    return qualifiedTable
  }

  return `SELECT * FROM ${qualifiedTable}`
}

export function appendTableInsert(currentQuery: string, qualifiedTable: string): string {
  const snippet = buildTableInsertSnippet(currentQuery, qualifiedTable)
  const trimmed = currentQuery.trimEnd()

  if (!trimmed) {
    return snippet
  }

  return `${trimmed} ${snippet}`
}

function needsLeadingSpace(before: string): boolean {
  return before.length > 0 && !/\s$/.test(before)
}

function needsTrailingSpace(after: string): boolean {
  return after.length > 0 && !/^\s/.test(after)
}

export function insertSnippetAtPosition(
  query: string,
  position: number,
  snippet: string,
): { nextQuery: string; cursor: number; insertedText: string } {
  const safePosition = Math.max(0, Math.min(position, query.length))
  const before = query.slice(0, safePosition)
  const after = query.slice(safePosition)

  const leadingSpace = needsLeadingSpace(before) ? ' ' : ''
  const trailingSpace = needsTrailingSpace(after) ? ' ' : ''
  const insertedText = `${leadingSpace}${snippet}${trailingSpace}`
  const nextQuery = `${before}${insertedText}${after}`
  const cursor = safePosition + insertedText.length

  return { nextQuery, cursor, insertedText }
}

export function insertTableAtPosition(
  query: string,
  position: number,
  qualifiedTable: string,
): { nextQuery: string; cursor: number; insertedText: string } {
  const snippet = buildTableInsertSnippet(query, qualifiedTable)
  return insertSnippetAtPosition(query, position, snippet)
}
