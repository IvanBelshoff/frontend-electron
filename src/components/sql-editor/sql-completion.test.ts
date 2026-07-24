import { describe, expect, it } from 'vitest'
import {
  buildParameterCompletionItems,
  buildSqlCompletionItems,
  filterCompletionItems,
  filterParameterCompletionItems,
} from './sql-completion'

describe('sql-completion', () => {
  it('builds parameter completion items', () => {
    const items = buildParameterCompletionItems([
      { nome: 'data_inicio', tipo: 'date' },
      { nome: 'status', tipo: 'enum', valores: ['ativo'] },
    ])

    expect(items).toEqual([
      {
        label: ':data_inicio',
        insertText: ':data_inicio',
        type: 'parameter',
        detail: 'parâmetro (date)',
      },
      {
        label: ':status',
        insertText: ':status',
        type: 'parameter',
        detail: 'parâmetro (enum)',
      },
    ])
  })

  it('includes dialect-specific functions', () => {
    const postgres = buildSqlCompletionItems('postgres').map((item) => item.label)
    const mysql = buildSqlCompletionItems('mysql').map((item) => item.label)

    expect(postgres).toContain('DATE_TRUNC')
    expect(mysql).toContain('DATE_FORMAT')
    expect(mysql).not.toContain('DATE_TRUNC')
  })

  it('filters keyword and function items by prefix', () => {
    const items = buildSqlCompletionItems('postgres')
    const filtered = filterCompletionItems(items, 'SEL')

    expect(filtered.some((item) => item.label === 'SELECT')).toBe(true)
    expect(filtered.every((item) => item.label.includes('SEL'))).toBe(true)
  })

  it('filters parameter items after colon', () => {
    const items = buildParameterCompletionItems([
      { nome: 'data_inicio', tipo: 'date' },
      { nome: 'data_fim', tipo: 'date' },
    ])

    const filtered = filterParameterCompletionItems(items, ':data_i')

    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.label).toBe(':data_inicio')
  })
})
