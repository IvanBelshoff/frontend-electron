const RESERVED_ALIASES = new Set([
  'on',
  'where',
  'group',
  'order',
  'having',
  'limit',
  'offset',
  'union',
  'left',
  'right',
  'inner',
  'outer',
  'cross',
  'full',
  'join',
  'from',
  'as',
  'and',
  'or',
  'select',
  'set',
  'values',
  'into',
])

export type TableAliasTarget = {
  schema?: string
  table: string
}

function stripSqlLiterals(sql: string): string {
  return sql.replace(/'[^']*'/g, "''").replace(/"[^"]*"/g, '""')
}

function parseQualifiedTable(qualified: string): TableAliasTarget {
  const parts = qualified.split('.')

  if (parts.length >= 2) {
    return {
      schema: parts.slice(0, -1).join('.'),
      table: parts[parts.length - 1] ?? qualified,
    }
  }

  return { table: qualified }
}

function registerAlias(
  aliases: Map<string, TableAliasTarget>,
  alias: string,
  target: TableAliasTarget,
): void {
  const normalized = alias.toLowerCase()

  if (RESERVED_ALIASES.has(normalized)) {
    return
  }

  aliases.set(normalized, target)
}

export function parseTableAliases(sql: string): Map<string, TableAliasTarget> {
  const aliases = new Map<string, TableAliasTarget>()
  const cleaned = stripSqlLiterals(sql)
  const clausePattern =
    /\b(?:from|join|inner\s+join|left\s+join|right\s+join|full\s+join|cross\s+join)\s+([\w.]+)(?:\s+(?:as\s+)?(\w+))?/gi

  for (const match of cleaned.matchAll(clausePattern)) {
    const qualified = match[1]
    const explicitAlias = match[2]

    if (!qualified) {
      continue
    }

    const target = parseQualifiedTable(qualified)
    const alias = explicitAlias ?? target.table

    registerAlias(aliases, alias, target)
  }

  return aliases
}

export function isFromOrJoinContext(textBeforeCursor: string): boolean {
  return /\b(?:from|join)\s+[\w.]*$/i.test(textBeforeCursor)
}
