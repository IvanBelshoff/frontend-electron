import { describe, expect, it } from 'vitest'
import { formatSqlQuery } from './sql-format.util'

describe('sql-format.util', () => {
  it('formats postgres sql', () => {
    const formatted = formatSqlQuery('select id, nome from usuarios where id = 1', 'postgres')

    expect(formatted).toContain('SELECT')
    expect(formatted).toContain('FROM')
  })

  it('formats mssql sql', () => {
    const formatted = formatSqlQuery('select top 10 * from relatorios', 'mssql')

    expect(formatted.toUpperCase()).toContain('SELECT')
  })

  it('does not throw on malformed sql', () => {
    const invalid = 'select from where'
    expect(() => formatSqlQuery(invalid, 'postgres')).not.toThrow()
    expect(typeof formatSqlQuery(invalid, 'postgres')).toBe('string')
  })

  it('keeps placeholders intact', () => {
    const sql = 'select * from usuarios where created_at >= :data_inicio'
    const formatted = formatSqlQuery(sql, 'postgres')

    expect(formatted).toContain(':data_inicio')
  })
})
