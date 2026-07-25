import type { SchemaCompletionContext } from '@/features/query-editor/query-editor-types'
import { isFromOrJoinContext, parseTableAliases, type TableAliasTarget } from '@/features/query-editor/sql-table-aliases'

const CONTEXT_WINDOW = 2000

export type SqlCompletionKind =
  | 'none'
  | 'schemaTables'
  | 'tablePartial'
  | 'column'
  | 'aliasColumn'
  | 'fromTable'

export type SqlCompletionContext = {
  kind: SqlCompletionKind
  token: string
  tokenFrom: number
  schema?: string
  table?: string
  partial?: string
  alias?: string
}

function getTokenAtEnd(text: string): { token: string; start: number } | null {
  const match = text.match(/([\w]+(?:\.[\w]*)*\.?)$/)

  if (!match || match.index === undefined) {
    return null
  }

  return {
    token: match[1],
    start: match.index,
  }
}

function getColumnsForTable(
  schemaContext: SchemaCompletionContext,
  target: TableAliasTarget,
): string[] {
  const qualifiedKey = target.schema ? `${target.schema}.${target.table}` : target.table

  return (
    schemaContext.columnsByTable[qualifiedKey] ??
    schemaContext.columnsByTable[target.table] ??
    []
  )
}

export function resolveColumnTarget(
  sql: string,
  pos: number,
  schemaContext: SchemaCompletionContext,
): TableAliasTarget | null {
  const windowStart = Math.max(0, pos - CONTEXT_WINDOW)
  const before = sql.slice(windowStart, pos)
  const tokenInfo = getTokenAtEnd(before)

  if (!tokenInfo?.token.endsWith('.')) {
    return null
  }

  const prefix = tokenInfo.token.slice(0, -1)
  const segments = prefix.split('.')

  if (segments.length === 1) {
    const aliases = parseTableAliases(sql.slice(0, pos))
    const aliasTarget = aliases.get(prefix.toLowerCase())

    if (aliasTarget) {
      return aliasTarget
    }

    if (schemaContext.schemas[prefix]) {
      return null
    }

    return { table: prefix }
  }

  if (segments.length === 2) {
    return {
      schema: segments[0],
      table: segments[1] ?? '',
    }
  }

  return null
}

export function resolveSqlCompletionContext(
  sql: string,
  pos: number,
  schemaContext: SchemaCompletionContext,
): SqlCompletionContext {
  const windowStart = Math.max(0, pos - CONTEXT_WINDOW)
  const before = sql.slice(windowStart, pos)
  const absoluteOffset = windowStart
  const tokenInfo = getTokenAtEnd(before)

  if (!tokenInfo) {
    return { kind: 'none', token: '', tokenFrom: pos }
  }

  const tokenFrom = absoluteOffset + tokenInfo.start
  const { token } = tokenInfo
  const aliases = parseTableAliases(sql)

  if (token.endsWith('.')) {
    const prefix = token.slice(0, -1)
    const segments = prefix.split('.')

    if (segments.length === 1) {
      const aliasTarget = aliases.get(prefix.toLowerCase())

      if (aliasTarget) {
        return {
          kind: 'aliasColumn',
          token,
          tokenFrom,
          alias: prefix,
          schema: aliasTarget.schema,
          table: aliasTarget.table,
        }
      }

      if (schemaContext.schemas[prefix]) {
        return {
          kind: 'schemaTables',
          token,
          tokenFrom,
          schema: prefix,
        }
      }

      return {
        kind: 'schemaTables',
        token,
        tokenFrom,
        schema: prefix,
      }
    }

    if (segments.length === 2) {
      return {
        kind: 'column',
        token,
        tokenFrom,
        schema: segments[0],
        table: segments[1],
      }
    }
  }

  const segments = token.split('.')

  if (segments.length === 2) {
    const aliasTarget = aliases.get(segments[0].toLowerCase())

    if (aliasTarget) {
      return {
        kind: 'aliasColumn',
        token,
        tokenFrom,
        alias: segments[0],
        schema: aliasTarget.schema,
        table: aliasTarget.table,
        partial: segments[1],
      }
    }

    return {
      kind: 'tablePartial',
      token,
      tokenFrom,
      schema: segments[0],
      partial: segments[1],
    }
  }

  if (isFromOrJoinContext(before)) {
    return {
      kind: 'fromTable',
      token,
      tokenFrom,
      partial: token,
    }
  }

  return { kind: 'none', token, tokenFrom }
}

export function getColumnsForCompletion(
  schemaContext: SchemaCompletionContext,
  completionContext: SqlCompletionContext,
): string[] {
  if (completionContext.kind === 'column' || completionContext.kind === 'aliasColumn') {
    if (!completionContext.table) {
      return []
    }

    return getColumnsForTable(schemaContext, {
      schema: completionContext.schema,
      table: completionContext.table,
    })
  }

  return []
}
