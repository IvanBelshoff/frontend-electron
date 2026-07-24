import type { TipoConexao } from '@/features/connections/connection-types'
import type { FormatOptionsWithLanguage } from 'sql-formatter'

export type SqlFormatterDialect = NonNullable<FormatOptionsWithLanguage['language']>

const DIALECT_BY_CONNECTION: Record<TipoConexao, SqlFormatterDialect> = {
  postgres: 'postgresql',
  mysql: 'mysql',
  mssql: 'tsql',
  oracle: 'plsql',
}

const CONNECTION_LABEL: Record<TipoConexao, string> = {
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  mssql: 'SQL Server',
  oracle: 'Oracle',
}

export function resolveSqlFormatterDialect(
  connectionTipo?: TipoConexao | null,
): SqlFormatterDialect {
  if (!connectionTipo) {
    return 'sql'
  }

  return DIALECT_BY_CONNECTION[connectionTipo]
}

export function resolveConnectionDialectLabel(connectionTipo?: TipoConexao | null): string {
  if (!connectionTipo) {
    return 'SQL'
  }

  return CONNECTION_LABEL[connectionTipo]
}
