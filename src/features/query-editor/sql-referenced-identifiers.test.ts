import { describe, expect, it } from 'vitest'
import {
  isColumnReferenced,
  isSchemaReferenced,
  isSchemaReferencedInExplorer,
  isTableReferenced,
  parseSqlReferencedIdentifiers,
} from '@/features/query-editor/sql-referenced-identifiers'

describe('parseSqlReferencedIdentifiers', () => {
  it('detects schema, table and columns from qualified references', () => {
    const references = parseSqlReferencedIdentifiers(`
      SELECT public.usuarios.id, public.usuarios.nome
      FROM public.usuarios
    `)

    expect(isSchemaReferenced(references, 'public')).toBe(true)
    expect(isTableReferenced(references, 'public', 'usuarios')).toBe(true)
    expect(isColumnReferenced(references, 'public', 'usuarios', 'id')).toBe(true)
    expect(isColumnReferenced(references, 'public', 'usuarios', 'nome')).toBe(true)
    expect(isColumnReferenced(references, 'public', 'usuarios', 'email')).toBe(false)
  })

  it('detects unqualified table and alias columns', () => {
    const references = parseSqlReferencedIdentifiers(`
      SELECT d.id, d.nome, d.icone
      FROM dashboards d
      ORDER BY d.nome
    `)

    expect(isTableReferenced(references, 'public', 'dashboards')).toBe(true)
    expect(isColumnReferenced(references, 'public', 'dashboards', 'nome')).toBe(true)
    expect(isColumnReferenced(references, 'pgboss', 'dashboards', 'nome')).toBe(true)
    expect(isColumnReferenced(references, 'public', 'dashboards', 'url')).toBe(false)
  })

  it('marks schema as referenced when it contains an unqualified table from the query', () => {
    const references = parseSqlReferencedIdentifiers(`
      SELECT d.id, d.nome
      FROM dashboards d
    `)

    expect(isSchemaReferenced(references, 'public')).toBe(false)
    expect(
      isSchemaReferencedInExplorer(references, 'public', ['dashboards', 'usuarios']),
    ).toBe(true)
    expect(isSchemaReferencedInExplorer(references, 'pgboss', ['jobs'])).toBe(false)
  })

  it('detects joins with aliases and schema-qualified tables', () => {
    const references = parseSqlReferencedIdentifiers(`
      SELECT p.id, i.quantidade
      FROM vendas.pedidos p
      JOIN vendas.itens i ON i.pedido_id = p.id
    `)

    expect(isSchemaReferenced(references, 'vendas')).toBe(true)
    expect(isTableReferenced(references, 'vendas', 'pedidos')).toBe(true)
    expect(isTableReferenced(references, 'vendas', 'itens')).toBe(true)
    expect(isColumnReferenced(references, 'vendas', 'itens', 'quantidade')).toBe(true)
    expect(isColumnReferenced(references, 'vendas', 'pedidos', 'id')).toBe(true)
  })

  it('ignores identifiers inside string literals', () => {
    const references = parseSqlReferencedIdentifiers(`
      SELECT *
      FROM public.usuarios
      WHERE nome = 'public.fake.tabela'
    `)

    expect(isSchemaReferenced(references, 'fake')).toBe(false)
    expect(isTableReferenced(references, 'public', 'fake')).toBe(false)
  })

  it('returns empty references for blank query', () => {
    const references = parseSqlReferencedIdentifiers('   ')

    expect(references.schemas.size).toBe(0)
    expect(references.qualifiedTables.size).toBe(0)
    expect(references.unqualifiedTables.size).toBe(0)
  })
})
