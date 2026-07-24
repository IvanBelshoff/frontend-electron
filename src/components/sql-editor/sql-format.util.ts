import { format } from 'sql-formatter'
import type { TipoConexao } from '@/features/connections/connection-types'
import { resolveSqlFormatterDialect } from './sql-dialect'

export function formatSqlQuery(sql: string, connectionTipo?: TipoConexao | null): string {
  const trimmed = sql.trim()

  if (!trimmed) {
    return sql
  }

  try {
    return format(trimmed, {
      language: resolveSqlFormatterDialect(connectionTipo),
      tabWidth: 2,
      keywordCase: 'upper',
    })
  } catch {
    return sql
  }
}
