import { describe, expect, it } from 'vitest'
import { resolveConnectionDialectLabel, resolveSqlFormatterDialect } from './sql-dialect'

describe('sql-dialect', () => {
  it('maps connection types to sql-formatter dialects', () => {
    expect(resolveSqlFormatterDialect('postgres')).toBe('postgresql')
    expect(resolveSqlFormatterDialect('mysql')).toBe('mysql')
    expect(resolveSqlFormatterDialect('mssql')).toBe('tsql')
    expect(resolveSqlFormatterDialect('oracle')).toBe('plsql')
    expect(resolveSqlFormatterDialect(null)).toBe('sql')
  })

  it('returns readable dialect labels', () => {
    expect(resolveConnectionDialectLabel('postgres')).toBe('PostgreSQL')
    expect(resolveConnectionDialectLabel(null)).toBe('SQL')
  })
})
